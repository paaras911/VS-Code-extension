#  README

A visual studio code extension that runs InferIDE using MagpieBridge
## Language Server

The extension uses InferIDE to run the analysis. The JAR (inferIDE-0.0.1.jar) is available in the resources folder. It can be created by running clean install -DskipTests on InferIDE (https://github.com/MagpieBridge/InferIDE) and copied into resources folder.

InferIDE uses MagpieBridge which has been extended with the web prototype
The JAR of this project is added as a dependency in InferIDE pom.xml file.
It can be created and used as a dependency in InferIDE by running the below command in MagpieBridge
mvn install:install-file -Dfile=<path-to-jar-file> -DgroupId=<group-id> -DartifactId=<artifact-id> -Dversion=<version> -Dpackaging=<packaging>

The VS Code extension communicates with MagpieServer using socket communication.
InferIDE should be run in socket mode using command '-jar inferIDE-0.0.1.jar -s' in another IDE

## Extension setup
Open the repository in VS Code
Run the command npm install in the repository's root folder to install npm modules.
Press F5 or run the "Launch Client" from the IDE to launches a new VS Code instance "[Extension Development Host]" with the above extension enabled.
Open a Java file and wait for Prototype to open and start.



