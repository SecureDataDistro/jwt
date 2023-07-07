# jwt

# JWT

The JWT package contains a number of JWT siging and verifying implementations that all implement the same interface.

Although there are a number of good JWT libraries out there, none offered a simple interface that we could reuse across a numbe rof potential use cases including GCP KMS, AWS KMS, or using some other security module backed implementation.

Everything under `src/siging/` is the source code to run the JWT sign and verify server. Everthing under `src/deploy` is Infrastructure as Code (IaC) and currently includes a AWS Lambda and KMS implementation.

# Environments

## Local JWT Development

A local in-memory server can be spun up by running:

`yarn local`

This will compile and start a server running on port 3000 that will sign tokens and publish the public key.

The Following Example uses the `iam` package which includes a simple cli for interacting with the JWT server to help with identity minting.

```
~/hub/packages/iam$ yarn cli --action sign --endpoint http://localhost:3000/token --entity 1111:testuser --claims 1111:testrepo
http://localhost:3000/token 1111:testuser [ '1111:testrepo' ]
{
  token: 'eyJhbGciOiJFUzM4NCJ9.eyJpc3MiOiJzZGQ6aHViOmlhbTpsb2NhbDpkY2Y5MjdlMC04ZmFmLTRmODAtYTVhNi0zN2I0MDNiM2UxZGYiLCJzdWIiOiJkc3M6b3JnOjExMTE6dXNlcjp0ZXN0dXNlciIsImNsYWltcyI6WyJkc3M6b3JnOjExMTE6cmVwbzp0ZXN0cmVwby8qIl0sImF1ZCI6InNkZDpodWI6bmV0d29yazpnYXRld2F5IiwianRpIjoiNjg4NjJiMzEtY2M4NS00OTdkLWI5ZTMtMjhjMTVlMmYxNDJhIiwibmJmIjoxNjg3ODIwNjAzMDY0LCJpYXQiOjE2ODc4MjA2MDMwNjQsImV4cCI6MTY4NzgyNDIwMzA2NH0.J2GovnQ7Pr6StgJMyHfPHUDDtaeX8vyL1Bt52YwYnIT-1YWdwLfJSztpXxbE-ScdnPS0auAZBX6P3PD-MhKh80L2RMgyPkgg111jahp3sh8CN9MXeWkjzDMlfm-LXA8A'
}

~/hub/packages/iam$ curl -XGET http://localhost:3000/pub
-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEzmhTyZ2sTCZlM6U/G9EOdQQzuTRWkoJU
ZoemU6KNJLV/iZw6IS7HveZTlG/J+8iiQ6nEOnU6GSGBZg14dLyTjPEPig6AJ36p
pWoAKEDeJyjmHgAbyaRv51fcQ0G6GY75
-----END PUBLIC KEY-----
```

These values can be copy and pasted into the [JWT.io debugger](https://jwt.io/#debugger-io?token=eyJhbGciOiJFUzM4NCJ9.eyJpc3MiOiJzZGQ6aHViOmlhbTpsb2NhbDpkY2Y5MjdlMC04ZmFmLTRmODAtYTVhNi0zN2I0MDNiM2UxZGYiLCJzdWIiOiJkc3M6b3JnOjExMTE6dXNlcjpqdCIsImNsYWltcyI6WyJkc3M6b3JnOjExMTE6cmVwbzp0ZXN0cmVwby8qIl0sImF1ZCI6InNkZDpodWI6bmV0d29yazpnYXRld2F5IiwianRpIjoiNDI1ZmI3MmEtNmQ1OC00ZGM4LWI4MTQtMzdkZWM5ZTRjN2VlIiwibmJmIjoxNjg3ODIwMDI4OTYzLCJpYXQiOjE2ODc4MjAwMjg5NjMsImV4cCI6MTY4NzgyMzYyODk2M30.AJVtK41fHKvEp2CgFX9qeDCCixmeJ6ZujRL5hGIqiAl0iV2i7Fu1kBqI8RLm32Iyk2d-5qrIPaDob5AevW2vhQO8S1Y-BlqhUszinvdvnMeP5q4IiQIAvMB2ZBTCdVTa&publicKey=-----BEGIN%20PUBLIC%20KEY-----%0AMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEzmhTyZ2sTCZlM6U%2FG9EOdQQzuTRWkoJU%0AZoemU6KNJLV%2FiZw6IS7HveZTlG%2FJ%2B8iiQ6nEOnU6GSGBZg14dLyTjPEPig6AJ36p%0ApWoAKEDeJyjmHgAbyaRv51fcQ0G6GY75%0A-----END%20PUBLIC%20KEY-----) to see the format of the JWT as well as its verification using the public key.

## Docker Build and Dev Deployment

The Dockerfile in this rebuild will mount the local source code and build the entire JWT service and set an entry point to run the service by default.

The following command will build the service.
```
docker build -t <your docker label> .
```

The following command will then run the service:

`docker run -it -p 3000:3000 <your docker label>`

The in-memory JWT service will then be available.

## Kubernetes Development

The JWT service can be installed by running the following command from the `package/jwt` dir: 
```
 helm install test-jwt ./src/deploy/helm/jwt-service/
```

Once this is up and running you can set up port forwarding to the app by using:

```
kubectl port-forward $(kubectl get pods --namespace default -l "app.kubernetes.io/name=jwt-service,app.kubernetes.io/instance=jwt" -o jsonpath="{.items[0].metadata.name}") 3001:3000
Forwarding from 127.0.0.1:3001 -> 3000
```

This will bridge the JWT service in k8s to a local port and allow you to use the CLI as you normally would