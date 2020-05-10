# Purpose
For an architecture built on trust between known systems, there is value in centralizing security controls inside the upstream web tier.  The alternative is a de-centralized model where security controls are distributed across downstream tiers which leads to support and maintenance complexities, performance lag, inefficient use of resources, and security risks.  This type of design is required for cases where integration is between unknown systems.

For this exercise, the assumption is the architecture is built on fully trusted between the web, application, and the data tiers, all tightly controlled, fully managed systems.

## Forces driving security enforcement in top upstream tier

1.  As applications evolve with new services or product lines, there needs be a way to independently manage, support, and maintain security controls without creating impediments to new features and compromising risks.

2.  Decouple security processes and management from downstream application functions.  This leads to loose coupling and higher cohesion as authentication & authorization, security workflow, audibility and other security tasks can be centrally managed without impact to other parts of the architecture.

3.  Security technology and business processes will evolve as new authentication and authorization workflows are identified.  This is driven not only by technology change but driven by business needs as well.  The respective systems need to evolve in a flexibility, independent manner.

4.  As application architecture grows with more customer load, the security and application services should not become a bottleneck, especially for cloud based implementation.

5.  The security system should maintain consistent performance and response times for customer requests.

6.  The security system should provide an way to easy to automate audits for vulnerability checks, review security workflows and algorithms, and enable security observability for alerts and threat monitoring.

7.  System should be built on automation for faster diagnostics, scale, extensibility, and ease of management in a micro-services environment.

8.  Optimize costs as system grows with business demands


## Solution

Design and implement an intercepting filter inside the web tier to centrally enforce security controls for every protected application service requests.  The component can integrate with security service API that is responsible for client token validation, audit, product level authorization, as well as providing common domain information for downstream services to consume.  If security checks fail, the intercepting filter will reject client request with 4XX status code.  If security checks pass, the intercepting filter will allow api request to flow through with common context information pertaining to the client.

By centralizing security functions inside this web server, extensibility, loose coupling, and high cohesion can be achieved without impacting other parts of the architecture.  Similarly, as other parts of the architecture evolves, it can be done without tight dependency on security inside the web-tier.

Scale concerns are also addressed by designing stateless security services with auto-scaling.  This not only addresses issues of high load, but addresses issues of capacity planning and efficient use of resources for cost management by using ephemeral services.

Observability, auditability and alerting is also achieved since these functions are in one place as opposed to distributed across many downstream systems.  And this becomes critical for production systems where speed to diagnostics and resolution matters in order to minimize business impact.

Most modern web servers, apache and nginx, provide modules for intercepting filters that can proxy to security services API or integrate with local, in-memory implementation.  For this design, intercepting filter will be configured to proxy to a sample validation service built using Okta IdP.

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

1.  IdP service.  Okta is used for this solution using a developer account.

2.  Token validation service.  It encapsulates the security logic for validating client access token and emitting common contextual information for downstream systems.

3.  Nginx web server configured with token validation service as the intercepting filter.

4.  Sample application service.  For this example, it is a sample watchlist service

5.  OpenID Connect Debugger for Okta authentication and access token generation.  The access token is required as the client credential for the sample application service request.

Item 2, 3 and 4 are provided in a subproject:  auth-api, nginx-conf and rest-api.

##  Client Request

Users can invoke the sample application service using curl or Postman:

```
curl -H “Authorization: Bearer <okta_access_token>” -kv https://localhost:8443/api/watchlist/1
```

The Token validation service will validate the okta_access_token before processing the sample API request.  

In order to successfully run this example, the Nginx web server with auth_request will need to be configured.  Please refer to nginx documentation for installation and setup details.  Also refer to nginx-conf subproject for sample configuration that includes auth_req and proxy_pass endpoint.

In addition, auth-api and rest-api subproject must also be setup and running.  By default, the auth-api sub-project listens on http port 2000.  For rest-api sample watchlist service, it listens on http port 3000.  See READM.md files in the respective projects for installation and setup details.


##  Okta Developer Account for IdP
Setup developer account at https://developer.okta.com/.

Once logged into the Okta Dashboard, follow the instructions to create a sample application with proper grant types.  For this sample, implicit grant type will be required.  Also take note and secure the “Client Id” and “Client secret” values.  These will be required to generate access token using OpenID Connect Debugger and for token validation against Okta introspect endpoint using the intercepting filter service in Nginx.

## Token validation service ( auth-api subproject )

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

On success, the service will return status 204 with client context info in JSON as part of the http response header, X-Basic-Profile.  The basic profile for this same contain user identity info such as username and email.  And it can easily be extended to include other domain specific information.

Refer to sub-project auth-api for more details.

## Auth-API Project


## Rest-API Project


## OpenID Connect (oidc)
Okta.Com Dev Account
https://oidcdebugger.com/debug


## Client Request


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
