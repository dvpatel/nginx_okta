# Purpose
For an architecture built on trust between known systems, there is value in centralizing security controls inside the upstream web tier.  The alternative is a de-centralized model where security controls are distributed across downstream systems.  This type of distribution in responsibility can lead to support and maintenance complexities, performance lag, inefficient use of resources, and security risks.

For this project, the assumption is the architecture is built on fully trusted interactions between the web, application, and the data tiers, all tightly controlled, fully managed.

## Forces driving security enforcement in top upstream tier

1.  As applications evolve with new services or product lines, there needs be a way to independently manage, support, and maintain security controls without creating impediments to new features and compromising risks.

2.  Decouple security processes and management from downstream application systems.  This leads to loose coupling and higher cohesion as authentication & authorization, security workflow, audibility and other security tasks can be centrally managed without impact to other parts of the architecture.

3.  Security technology and business processes will evolve as new authentication and authorization workflows are identified.  This is driven not only by technology changes but driven by business needs as well.  The respective systems need to evolve in a flexibility, independent manner.

4.  As application architecture grows with more customer load, the security and application services should not become a performance bottleneck, especially for cloud based implementation.

5.  The security system should maintain consistent performance and response times for customer requests.

6.  The security system should provide an way to easy to automate audits for vulnerability checks, review security workflows and algorithms, and enable security observability for alerts and threat monitoring.

7.  System should be built on automation for faster diagnostics, scale, extensibility, and ease of management in a micro-services environment.

8.  Optimize costs as system grows with business demands.


## Solution

Design and implement an intercepting filter inside the web tier to centrally enforce security controls for every protected application service requests.  The component can integrate with security service API that is responsible for client token validation, audit, product level authorization, as well as providing common domain information for downstream services to consume.  If security checks fail, the intercepting filter will reject client request with 4XX status code.  If security checks pass, the intercepting filter will allow api request to flow through with propagation of common context information describing the authenticated, validated client entity.

By centralizing security functions inside this web server, extensibility, loose coupling, and high cohesion can be achieved without impacting other parts of the architecture.  Similarly, as other parts of the architecture evolves, it can be done without tight dependency on security inside the web-tier.

Scale concerns are also addressed by designing stateless security services with auto-scaling.  This not only addresses issues of high load, but addresses issues of capacity planning and efficient use of resources for cost management by using ephemeral services.

Observability, auditability and alerting is also achieved since these functions are in one place as opposed to distributed across many downstream systems.  And this becomes critical for production systems where speed to root cause analysis and resolution matters in order to minimize customer and business impact.

Most modern web servers, apache and nginx, provide modules for intercepting filters that can proxy to security services API or integrate with local, in-memory implementation.  For this design, intercepting filter will be used to proxy to a sample validation service built using Okta IdP.

##  Logical Flow:

```
API_Request(client_token,api_params) --->  Web-Tier::intercepting_filter --->  https://security_svc(client_token):user_context
                                                     |
                                                     |
                                            req_header:user_context
                                                     |
                                                     |-------->  App_Tier_Svc(user_context, api_params):results
```

# Components & Dependencies

The key components to enable this solution are:

1.  Client request

2.  IdP service.  Okta is used for this solution using a developer account.  Any open system IdP solution can work.

3.  Token validation service.  It encapsulates the security logic for validating client access token and emitting common contextual information for downstream systems to use.

4.  Nginx web server configured with token validation service as the intercepting filter.

5.  Sample application service.  For this example, it is a sample watchlist service

6.  OpenID Connect Debugger for Okta authentication and access token generation.  The access token is required as the client credential for the sample application service request.

Item 3 - 5 are provided in a subproject:  auth-api, nginx-conf and rest-api.

##  Client Request

Users can invoke the sample application service using curl or Postman:

```
curl -H “Authorization: Bearer <okta_access_token>” -kv https://localhost:8443/api/watchlist/1
```

The token validation service will validate the okta_access_token before processing the sample API request.  

In order to successfully run this example, the Nginx web server with auth_request will need to be configured.  Please refer to nginx documentation for installation and setup details.  Also refer to nginx-conf subproject for sample configuration that includes auth_req and proxy_pass endpoint for the intercepting filter.

In addition, auth-api and rest-api subprojects must also be setup and running.  By default, the auth-api sub-project listens on http port 2000.  For rest-api sample watchlist service, it listens on http port 3000.  See READM.md files in the respective projects for installation and setup details.


##  Okta Developer Account for IdP
Setup developer account at https://developer.okta.com/.

Once logged into the Okta Dashboard, follow the instructions to create a sample application with proper grant types.  For this sample, implicit grant type will be required.  Also take note and secure the “Client Id” and “Client secret” values.  These will be required to generate access token using OpenID Connect Debugger and for token validation against Okta introspect endpoint using the intercepting filter service in Nginx.

## Token validation service ( auth-api, nginx-conf subprojects )

This service encapsulates the processes for validating client access token using Okta introspect endpoint and cached values.  

For this implementation, the cache is configured using a memory store.  For larger deployments, the cache store can easily be reconfigured to use external cache service provider, ie. Redis, for better performance.  See NestJs for details.

The endpoint for the token validation service is http://localhost:2000/validate.  It is configured as follows in Nginx:

```
        #  auth request endpoint
        location = /bearer_token_introspect {
            internal;
            proxy_method      POST;
            proxy_set_header  Content-Type "application/x-www-form-urlencoded";
            proxy_pass        http://localhost:2000/validate;
        }
```

To test the endpoint directly:

```
curl -H “Authorization: Bearer <okta_access_token>” -X POST -kv http://localhost:2000/validate
```

On success, the service will return status 204 with client context info in JSON as part of the http response header, X-Basic-Profile.  The basic profile contain user identity info such as username, user id and email that can be used in downstream systems for domain specific processing.  The validate endpoint can also easily be extended to include other common, domain specific information.

On token validation failure, the service will return either status code 403 (FORBIDDEN) for inactive token or 401 (UNAUTHORIZED) for invalid token.

Refer to sub-project auth-api and okta module for more details.

## Watchlist application service ( rest-api subproject )

Watchlist is the sample service that sits behind token validation.  It runs on NodeJS using NestJS framework.  Only a valid token with an active profile is required for access. If an active profile is not provided, the service will return an error with 4XX status code.

To test the endpoint directly:

```
curl -kv -H "Authorization: Bearer <access_token>" https://localhost:8443/api/watchlist/1
```  

On success, the service will return a JSON payload with a fictitious watchlist object for the given identifier (:1)

Refer to sub-project rest-api and watchlist module for more details.  Also nginx needs to be configured and running with api endpoint:

```
        #  rest api
        location /api {
            # Any request to path will first be sent for auth
            auth_request /bearer_token_introspect;
            auth_request_set $x_basic_profile $upstream_http_x_basic_profile;

            proxy_pass http://localhost:3000;
            proxy_set_header X-Basic-Profile $x_basic_profile;
            proxy_set_header Authorization "$http_authorization";

            rewrite ^/api/?(.*) /$1 break;
        }
```

## OpenID Connect (oidc) Debugger

https://oidcdebugger.com/debug

This tool allows to generate and test oidc requests after Okta authentication.  The prarams to generate the okta access token are:

```
   Authorize URI (required):
   https://dev-XXXX.okta.com/oauth2/default/v1/authorize

   Redirect URI (required)
   https://oidcdebugger.com/debug

   Client ID (required)
   <Value from Okta dev applicaiton>
   
   Scope (required)
   openid
   
   State
   123
   
   Nonce
   <random val>

   Response type (required)
   token
   
   Response mode (required)
   form_post
```

If the authenticated sessions is expired or unavailable, it will prompt for Okta authentication.  On successful authentation, the system will generate base64 encoded Access Token.  Use this value as part of the Authorization Bearer token for the sample watchlist request.

##  References
Okta Developer Account:   https://developer.okta.com/
Okta Token Validation:  https://developer.okta.com/docs/guides/validate-id-tokens/overview/
OpenID Connect Debugger:  https://oidcdebugger.com/debug
Nginx Module:  http://nginx.org/en/docs/http/ngx_http_auth_request_module.html
NestJS Framework: https://docs.nestjs.com/

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Dipesh Patel](https://www.linkedin.com/dipeshpate)

## License

  Nest is [MIT licensed](LICENSE).
