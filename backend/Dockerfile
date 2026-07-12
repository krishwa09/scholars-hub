# ---- build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q clean package -DskipTests

# ---- run stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# SPRING_PROFILES_ACTIVE=prod + the DB_* / SPRING_DATASOURCE_* env vars switch to Postgres.
# MaxRAMPercentage keeps the JVM within small free-tier containers (e.g. Render's 512MB)
# instead of the default 25% heap, which can OOM under load.
ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=70 -XX:+UseSerialGC -jar app.jar"]
