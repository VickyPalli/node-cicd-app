pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        ACCOUNT_ID = "730335195287"
        ECR_REPO = "node-cicd-app"
        CLUSTER = "node-cicd-cluster"
        SERVICE = "node-cicd-service"
        TASK_FAMILY = "node-cicd-task"
        IMAGE_TAG = "${env.GIT_COMMIT.take(7)}"
    }

    stages {
        stage('Login to ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region $AWS_REGION | docker login \
                --username AWS \
                --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $ECR_REPO:$IMAGE_TAG .
                '''
            }
        }

        stage('Tag Docker Image') {
            steps {
                sh '''
                docker tag $ECR_REPO:$IMAGE_TAG \
                $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG
                '''
            }
        }

        stage('Push Image to ECR') {
            steps {
                sh '''
                docker push \
                $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG
                '''
            }
        }

        stage('Update ECS Task Definition') {
            steps {
                sh '''
                aws ecs describe-task-definition \
                --task-definition $TASK_FAMILY \
                --region $AWS_REGION \
                --query taskDefinition > task-definition.json

                jq --arg IMAGE "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG" \
                '.containerDefinitions[0].image=$IMAGE |
                del(
                .status,
                .revision,
                .taskDefinitionArn,
                .requiresAttributes,
                .compatibilities,
                .registeredAt,
                .registeredBy,
                .deregisteredAt
                )' task-definition.json > new-task-def.json

                NEW_TASK_DEF=$(aws ecs register-task-definition \
                --region $AWS_REGION \
                --cli-input-json file://new-task-def.json)

                NEW_TASK_DEF_ARN=$(echo $NEW_TASK_DEF | jq -r '.taskDefinition.taskDefinitionArn')

                aws ecs update-service \
                --cluster $CLUSTER \
                --service $SERVICE \
                --task-definition $NEW_TASK_DEF_ARN \
                --force-new-deployment \
                --region $AWS_REGION
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment Successful 🚀"
        }

        failure {
            echo "Deployment Failed ❌"
        }
    }
}