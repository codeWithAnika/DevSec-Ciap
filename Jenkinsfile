pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME = 'examflow'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Run Automated Tests') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build --pull -t examflow:${BUILD_NUMBER} -t examflow:ci .'
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                    mkdir -p reports
                    trivy image --format json --output reports/trivy-examflow-${BUILD_NUMBER}.json examflow:${BUILD_NUMBER}
                    trivy image --format table --output reports/trivy-examflow-${BUILD_NUMBER}.txt examflow:${BUILD_NUMBER}
                '''
            }
        }

        stage('Enforce Vulnerability Threshold') {
            steps {
                sh '''
                    trivy image --exit-code 1 --severity HIGH,CRITICAL examflow:${BUILD_NUMBER}
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/trivy-examflow-*', allowEmptyArchive: true
            junit testResults: 'test-results/**/*.xml', allowEmptyResults: true
        }
        success {
            echo 'ExamFlow tests, Docker build, and Trivy security checks completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the stage logs and archived Trivy reports.'
        }
    }
}
