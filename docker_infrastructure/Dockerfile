# Java Standalone
FROM openjdk:11
WORKDIR /usr/src/myapp
COPY . /usr/src/myapp
RUN javac Test.java
CMD ["java", "Test"]

# Springboot using amazon side java 21 image,
# Dumping in the home folder, since only 1 file
FROM amazoncorretto:21
COPY userservice-0.0.1-Snapshot.jar userservice-0.0.1-Snapshot.jar
CMD ["java", "--jar", "/userservice-0.0.1-Snapshot.jar"]


# Springboot Using Openjdk
FROM openjdk:17
WORKDIR /usr/src/myapp
COPY . .
CMD ["java", "--jar", "xyx.jar"]
