Write-Host "Downloading OpenJDK 17..."
Invoke-WebRequest -Uri "https://aka.ms/download-jdk/microsoft-jdk-17.0.9-windows-x64.zip" -OutFile "jdk.zip"
Write-Host "Extracting OpenJDK 17..."
Expand-Archive -Path "jdk.zip" -DestinationPath "C:\jdk" -Force
$javaExe = (Get-ChildItem -Path "C:\jdk" -Recurse -Filter "java.exe")[0].FullName
Write-Host "Java installed at $javaExe"

Write-Host "Downloading Jenkins..."
Invoke-WebRequest -Uri "https://get.jenkins.io/war-stable/2.426.3/jenkins.war" -OutFile "jenkins.war"

Write-Host "Downloading Minikube..."
Invoke-WebRequest -Uri "https://storage.googleapis.com/minikube/releases/latest/minikube-windows-amd64.exe" -OutFile "minikube.exe"

Write-Host "Starting Minikube..."
.\minikube.exe start --driver=docker

Write-Host "Starting Jenkins in the background..."
Start-Process -NoNewWindow -FilePath $javaExe -ArgumentList "-jar", "jenkins.war", "--httpPort=8080"

Write-Host "Setup Complete! Wait a few minutes for Jenkins to start on http://localhost:8080"
