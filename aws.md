## Execute Docker containers in [AWS Fargate](https://aws.amazon.com/fargate/)
> AWS Fargate is a technology for Amazon ECS that allows you to run containers without having to manage servers or clusters.

### Basic setup steps:

- Create [AWS account](https://aws.amazon.com/)
- Download and install [AWS CLI](https://aws.amazon.com/cli/)
    ```
    sudo pip install awscli
    ```

- Configure AWS CLI
    ```
    # Set to US East - N. Virginia region
    $ aws configure
    AWS Access Key ID [None]: <YOUR_KEY_ID>
    AWS Secret Access Key [None]: <YOUR_SECRET_ACCESS_KEY>
    Default region name [None]: us-east-1
    Default output format [None]:

    # Login to AWS
    $ aws ecr get-login --no-include-email --region us-east-1

    # Use the output from previous command
    $ docker login ...

- Build and push Docker containers into [AWS ECR](https://console.aws.amazon.com/ecs/home?region=us-east-1#/repositories) (id is your AWS account ID)
    ```
    # Build container image for AWS
    $ npm run docker-build-aws

    # Tag the containers
    $ docker tag draaljsapp_web:latest <id>.dkr.ecr.us-east-1.amazonaws.com/draaljs-app:latest
    docker tag draaljsapp_aws_nginx:latest <id>.dkr.ecr.us-east-1.amazonaws.com/draaljs-nginx:latest

    # Upload to AWS ECR
    $ docker push <id>.dkr.ecr.us-east-1.amazonaws.com/draaljs-app:latest
    $ docker push <id>.dkr.ecr.us-east-1.amazonaws.com/draaljs-nginx:latest
    ```

- Create a cluster
    ```
    $ aws ecs create-cluster --cluster-name draaljs-cluster
    ```

- Register task definition. Current task definition consists of 2 containers, nginx and app. Application container is responsible of all business related logic, everything else is left for the nginx container (media serving, gzip encoding, etc)
    ```
    $ aws ecs register-task-definition --cli-input-json file://<path-prefix>/draal-jsapp/config/aws/fargate-task.json

- List task definitions
    ```
    $ aws ecs list-task-definitions
    ```

- Create a service
    ```
    $ aws ecs create-service --cluster draaljs-cluster --service-name draaljs-fargate-service --task-definition draaljs-fargate:1 --desired-count 1 --launch-type "FARGATE" --network-configuration "awsvpcConfiguration={subnets=[subnet-6696a659],securityGroups=[sg-a8f619e1],assignPublicIp=ENABLED}"
    ```

- Describe the running service
    ```
    $ aws ecs describe-services --cluster test-cluster --services fargate-service
    ```

- Stop service
    ```
    $ aws ecs update-service --cluster draaljs-cluster --service draaljs-fargate-service --desired-count 0
    ```

- Restart service
    ```
    $ aws ecs update-service --cluster draaljs-cluster --service draaljs-fargate-service --task-definition draaljs-fargate:1 --desired-count 1 --network-configuration "awsvpcConfiguration={subnets=[subnet-6696a659],securityGroups=[sg-a8f619e1],assignPublicIp=ENABLED}"
    ```

The [subnet and security groups]( https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/vpc-subnets-commands-example.html) can be created, for example using following steps

- Create a VPC with a 10.0.0.0/16 CIDR block
    ```
    $ aws ec2 create-vpc --cidr-block 10.0.0.0/16
    ```

- Using the VPC ID from the previous step, create a subnet with a 10.0.1.0/24 CIDR block
    ```
    $ aws ec2 create-subnet --vpc-id vpc-344a294f --cidr-block 10.0.1.0/24
    ```

- Create a second subnet in your VPC with a 10.0.0.0/24 CIDR block
    ```
    $ aws ec2 create-subnet --vpc-id vpc-344a294f --cidr-block 10.0.0.0/24
    ```

- Create an Internet gateway (Internet gateway ID is returned in the response)
    ```
    $ aws ec2 create-internet-gateway
    ```

- Attach the Internet gateway to your VPC
    ```
    $ aws ec2 attach-internet-gateway --vpc-id vpc-344a294f --internet-gateway-id igw-95a910ed
    ```

- Create a custom route table for your VPC (route table ID is returned in the response)
    ```
    $ aws ec2 create-route-table --vpc-id vpc-344a294f
    ```

- Create a route in the route table that points all traffic (0.0.0.0/0) to the Internet gateway
    ```
    $ aws ec2 create-route --route-table-id rtb-4954cf35 --destination-cidr-block 0.0.0.0/0 --gateway-id igw-95a910ed
    ```

- To confirm that your route has been created and is active, you can describe the route table and view the results
    ```
    $ aws ec2 describe-route-tables --route-table-id rtb-4954cf35
    ```

- The route table is currently not associated with any subnet. You need to associate it with a subnet in your VPC so that traffic from that subnet is routed to the Internet gateway. First, use the describe-subnets command to get your subnet IDs. You can use the --filter option to return the subnets for your new VPC only, and the --query option to return only the subnet IDs and their CIDR blocks
    ```
    $ aws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-344a294f" --query 'Subnets[*].{ID:SubnetId,CIDR:CidrBlock}'
    ```

- You can choose which subnet to associate with the custom route table, for example, subnet-6696a659. This subnet will be your public subnet
    ```
    $ aws ec2 associate-route-table  --subnet-id subnet-6696a659 --route-table-id rtb-4954cf35
    ```

- You can optionally modify the public IP addressing behavior of your subnet so that an instance launched into the subnet automatically receives a public IP address.
    ```
    $ aws ec2 modify-subnet-attribute --subnet-id subnet-6696a659 --map-public-ip-on-launch
    ```

- Create a security group in your VPC, and add a rule that allows HTTP access from anywhere
    ```
    $ aws ec2 create-security-group --group-name DraalAccess --description "Security group for Draal access" --vpc-id vpc-344a294f
    $ aws ec2 authorize-security-group-ingress --group-id sg-a8f619e1 --protocol tcp --port 80 --cidr 0.0.0.0/0
    ```
