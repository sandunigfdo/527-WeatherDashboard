# 527-WeatherDashboard

The Cloud-Based Weather Dashboard Application is designed to provide users with accurate and up-to-date weather information, tailored to their specific location. Leveraging modern cloud technologies and comprehensive weather data from the Open-Meteo API, the application aims to offer a seamless and interactive user experience.

# Local setup

- Create `.env` file in root directory, which should contain:
  ```env
  USER_POOL_ID (AWS Cognito User Pool ID)
  CLIENT_ID (AWS Cognito User Pool Client APP ID)
  CLIENT_SECRET (AWS Cognito User Pool Client APP Secret)
  API_KEY (GeoLocation API Key)
  ```
  The properties are shared among group members.
  Please keep them secret only inside the group.
- Run `npm install`
- Run `node app.js` to start the application
- If successful, you can access the application at `localhost:3000`

# Leaflet configuration
- Using Leaflet in [main.js](public%2Fjs%2Fmain.js)
- Default settings in folder [leaflet](public/leaflet)

# AWS Elastic Beanstalk Deployment and CI/CD Pipeline Setup

## Steps to Deploy the Application using AWS Management Console

1. **Navigate to Elastic Beanstalk**
  - Log in to the [AWS Management Console](https://aws.amazon.com/console/) and search for **Elastic Beanstalk**.

2. **Create a New Application**
  - **Application name**: e.g., `MyWeatherApp`.
  - **Environment name**: Provide a unique name for your environment.
  - **Platform**: Select **Node.js**.
  - **Application code**: Choose **Sample application** to deploy a default sample app.
  - **Environment type**: Choose **Single instance**.

3. **Create Service Role and EC2 Instance Role**
  - **Service Role**:
    - Create a service role with the following policies:
      - `AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy`
      - `AWSElasticBeanstalkEnhancedHealth`
      - `AWSElasticBeanstalkService`
      - `AmazonElasticMapReduceforEC2Role`
      - `AWSElasticBeanstalkWebTier`
  - **EC2 Instance Role**:
    - Create an EC2 Instance Profile with the following policies:
      - `AWSElasticBeanstalkWebTier`

4. **Configure the Environment**
  - Choose the appropriate **architecture** (e.g., 64-bit) and **instance type** (e.g., `t2.micro`).
  - Add any necessary **environment variables** required for your application.

5. **Create the Environment**
  - AWS Elastic Beanstalk will provision resources such as EC2 instances, Elastic Load Balancer (ELB), Auto Scaling, and security groups.
  - Wait for the environment to finish setting up.

---

## Steps to Implement CI/CD Pipeline with Elastic Beanstalk and GitHub

1. **Navigate to CodePipeline**
  - In the AWS Management Console, search for **CodePipeline** and click **Create Pipeline**.

2. **Create a New Pipeline**
  - **Pipeline Name**: Provide a name for the pipeline (e.g., `MyNodeJSPipeline`).
  - **Service Role**: Select **Create new role** to let AWS create the necessary permissions for the pipeline.

3. **Set Up Source (GitHub)**
  - **Source Provider**: Select **GitHub**.
  - **Connect GitHub**: Click **Connect to GitHub** and authorize AWS access to your GitHub account.
  - **Select Repository and Branch**: Choose the **GitHub repository** and **branch** to deploy from.
  - Select **specify filter** as the trigger, **Push** as the Event type and **Branch** as the Filter type.

4. **Configure Build Stage**
  - **Build Provider**: Choose **AWS CodeBuild**.
  - **Create Build Project**: Provide a name for the project (e.g., `MyNodeJS`).
  - **Buildspec**: Ensure that a `buildspec.yml` file exists in the root directory of your GitHub repository.

5. **Set Up Deploy Stage**
  - **Deploy Provider**: Choose **AWS Elastic Beanstalk**.
  - **Application Name and Environment**: Select the **Application Name** and **Environment** created earlier in Elastic Beanstalk.

6. **Create the Pipeline**
  - Review the pipeline settings and click **Create Pipeline**. This will automatically start building and deploying your application on commits.

---

### Summary

This guide outlines how to deploy the application using AWS Elastic Beanstalk and configure a CI/CD pipeline with GitHub. 
