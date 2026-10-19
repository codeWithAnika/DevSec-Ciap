pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME = 'devsec-online-exam'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment & Dependencies') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci --prefer-offline || npm install'
            }
        }

        stage('Run Automated Tests') {
            steps {
                sh 'npm test'
                sh 'npm run test:junit'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build --no-cache -t devsec-online-exam:1.2 -t examflow:${BUILD_NUMBER} -t examflow:ci .'
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
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
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

