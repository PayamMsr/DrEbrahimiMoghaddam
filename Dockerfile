FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore

RUN dotnet publish \
    src/DrEbrahimi.API/DrEbrahimi.API.csproj \
    -c Release \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8090

EXPOSE 8090

ENTRYPOINT ["dotnet", "DrEbrahimi.API.dll"]