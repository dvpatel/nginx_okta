# Purpose
There are technical benefits of centralizing security controls in upstream systems of a multi-tier, micro-services architecture.  Centralization allows security controls to be modular where extensibility, maintainability, and security observability becomes much easier to support and manage.

## Forces

1.  As applications evolve with new features, there needs be a way to independently manage, support, and maintain security controls without creating impediments to new features.

2.  Decouple security processes from downstream systems to support loose coupling and higher cohesion for security workflow enhancements, audit-ability, security SDK updates, and other security tasks.

3.  As application platform grows with more customer load, the security control points should not become a performance bottleneck.

4.  Automate vulnerability checks, security workflows and algorithm compliance, and enable security observability for alerts and monitoring.

5.  System should be built on automation for faster diagnostics, scale, and ease of management in a complex micro-services environment.

6.  Optimize costs as system grows with business demands and security complexity.


## Solution

Design and implement an intercepting filter pattern in an upstream system (web-tier) to centrally enforce security controls for protected API requests.  The intercepting filter can be integrated with security service API responsible for client token validation, audit, authorization, as well as providing domain specific information for downstream services processing.  

The intercepting filter will protect downstream systems on failed validation by rejecting client request with 4XX status code.  If security checks pass, it will allow api request to process through with propagation of user profile context to downstream system for domain specific processing.

By centralizing security functions to the upstream web server, extensibility can also be achieved without impacting other parts of the architecture.  Similarly, as other parts of the architecture evolves, it can be done without tight dependency on security components.

Scale concerns are also addressed by designing stateless security services with auto-scaling.  This not only addresses issues of high load, but addresses issues of capacity planning and efficient use of resources for cost optimization by using ephemeral services.

Observability, auditability and alerting is also achieved since these functions are in one place as opposed to distributed across many downstream systems.  This becomes critical for production systems where speed to root cause analysis and resolution matters in order to minimize customer and business impact.

Most modern web servers such as apache and nginx provide intercepting filter modules that can proxy to security services API or integrate with local, in-memory implementation.  For this sample, proxy to external validation service will be used.

##  Logical Flow:

```
API_Request(access_token,api_params) --->  Web::intercepting_filter --->  https://security_svc(access_token):BASIC_PROFILE
                                                     |
                                                     |
                                            req_header:BASIC_PROFILE
                                                     |
                                                     |-------->  App_Tier_Svc(BASIC_PROFILE, api_params):results
```

# Components & Dependencies

The main components to enable this solution are:

1.  Client request

2.  IdP service.  Okta is used for this solution using a developer account.  Any open system IdP solution can work.

3.  Token validation service.  Encapsulates the security logic for validating client access token and emitting common contextual information for downstream systems to use.

4.  Nginx web server configured with token validation service end-point as the intercepting filter.

5.  Sample application service.  For this example, it is a sample watchlist service

6.  OpenID Connect Debugger for Okta authentication and access token generation.  The access token is required as the client credential for the sample application service request.

Item 3 - 5 are provided in a subproject:  auth-api, nginx-conf and rest-api.

##  Client Request

Users can invoke the sample application using curl or Postman:

```
curl -H “Authorization: Bearer <okta_access_token>” -kv https://localhost:8443/api/watchlist/1
```

The token validation service in the web tier will validate the Okta access_token before processing the sample API request.  On successful validation, watchlist will be returned to the client.

To successfully run this example, the Nginx web server will need to be configured and running with auth_request module.  Please refer to nginx documentation for installation and setup details.  Also refer to nginx-conf subproject for sample configuration that includes auth_req and proxy_pass modules for the intercepting filter.

In addition, auth-api and rest-api subprojects must also be setup and running.  By default, the auth-api subproject listens on http port 2000.  For rest-api sample watchlist service, it listens on http port 3000.  See READM.md files in the respective projects for installation and setup details.

NOTE:  this is a sample project.  For a real production project, secure http should be used for all integrations to maintain data confidentiality.

##  Okta Developer Account for IdP
Setup developer account at https://developer.okta.com/.

Once logged into the Okta Dashboard, follow the instructions to create a sample application with proper grant types.  For this sample, implicit grant type will be required.  Also take note of the “Client Id” and “Client secret” values.  These will be required to generate access token using OpenID Connect Debugger and for configuring the token validation service using Okta introspect endpoint.

## Token validation service ( auth-api, nginx-conf subprojects )

This service, written in NestJS framework, encapsulates the processes for validating client access token using Okta introspect endpoint and cached values.  Refer to Okta module in the project for the validation workflow and required parameters to connecto to Okta introspect endpoint.

For this implementation, the cache is configured using a memory store.  For larger deployments, the cache store can easily be reconfigured to use external cache provider, ie. Redis, for better performance.  See NestJs for cache store options.

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

The okta_access_token is retrieved from Open Connect Debugger tool.  See details below.

On successful execution, the service will return status 204 with client context info in JSON as part of the http response header, X-Basic-Profile.  The basic profile contains user identity info such as username, user id and email that can be used in downstream systems for domain specific processing.  This endpoint can easily be extended to emit other domain specific information based on busienss needs.

On token validation failure, the service will return either status code 403 (FORBIDDEN) for inactive token or 401 (UNAUTHORIZED) for invalid token.

Refer to sub-project auth-api and okta module for more details.

## Watchlist application service ( rest-api subproject )

Watchlist is the sample service that sits behind token validation.  It also runs on Node using NestJS framework.  A valid access token with an active profile is required for access. If an active profile is not provided, the service will reject client request with 4XX error code.

To test the endpoint:

```
curl -kv -H "Authorization: Bearer <okta_access_token>" https://localhost:8443/api/watchlist/1
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

This tool is used to generate and test oidc requests after Okta authentication.  The prarams to generate the okta access token are:

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

If the authenticated sessions is expired or unavailable, the tool will prompt user for Okta authentication.  On successful authentation, the system will generate base64 encoded access token that will be used as part of the Authorization Bearer token for the sample watchlist request.

##  References
-  Auth-API: (https://github.com/dvpatel/nginx_okta/auth-api)
-  Watchlist Sample Rest-API: (https://github.com/dvpatel/nginx_okta/rest-api)
-  Nginx-Conf: (https://github.com/dvpatel/nginx_okta/nginx-conf)
-  Okta Developer Account:   (https://developer.okta.com/)
-  Okta Token Validation:  (https://developer.okta.com/docs/guides/validate-id-tokens/overview/)
-  OpenID Connect Debugger:  (https://oidcdebugger.com/debug)
-  Nginx Module: (http://nginx.org/en/docs/http/ngx_http_auth_request_module.html)
-  NestJS Framework: (https://docs.nestjs.com/)

## Stay in touch

- Author - [Dipesh Patel](https://www.linkedin.com/in/dipeshpatel)

## License

  Nest is [MIT licensed](LICENSE).
