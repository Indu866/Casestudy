
pipeline {
    agent any

    stages {
       
        stage('Build Images') {
            steps {
                sh '''
                    docker build -t indupriyasanga/complaint-frontend:latest complaint-management-system
                    docker build -t indupriyasanga/complaint-backend:latest backend
                '''
            }
        }

        stage('Login to Docker Hub') {
            steps {
               
                    sh 'docker login -u "indupriyasanga" -p "Indu@2006'
                
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push indupriyasanga/complaint-frontend:latest
                    docker push indupriyasanga/complaint-backend:latest
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }

    }
}
