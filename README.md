# Purpose
In a multi-tier architecture built on trusted systems, there is business and technical value of centralizing security controls, specifially inside the web or api tier of application architecture.  The alterantive is a de-centralized model where security controls are dupliciated across the various tiers leading to support and maintenace complexities, efficient use of resources, performance, and security risks.  And this is required for cases where the multi-tier architecture is built on untrusted systems.

For this scope, the assumption is the multi-tier archirecture is built no trust between the web, application, and the data tiers.

## Forces
The drivers for centralized security controls inside the web or api tier  are:
  
#  Separation of responsibility.  Decouple security processes and management from downstream application functions.  This leads to tighter security as authentication & authorization, security workflow, audiability and other security tasks can be centrally managed without impact to other parts of the architecture components.

#  Ease of management.  As application architecture evolves with hundress of new services or platform evolves with new product lines, there needs be to a robust security in place so that key tasks are common and standards driven

#  Extensibility.  Security technology and processes will evolve as new authentication and authorization workflows are indentified.  This is driven not only by technical innovation but driven by business needs as well.  By centralize security functions inside the web-tier, extensibility can be achieved without impacting other parts of the architectur.  Similarly, as other parts of the archiecture evolves, it can be done without tight depenency on security

#  Scalability.  As application architecture evoles with more customer load, the security controls and application services shold not become an impediment, especially for cloud based implementation.  This could be achieved by designing stateless services with autoscalaing for both components.

#  High Performance.  

## Solution

Implement an intercepting filter inside the web tier that enforces security checks for every protected application service requests.  The component can integrate with a dedicated API that is centrally responsible for client token validation, audit, product level authorization checks, as well as providing context information for downstrea services.  

For most modern web servers, apache and nginx, they both provide intercepting filter modules that can proxy to security services API or integrate with local, in-memory implementation.  For this design, intercenting filter will be configured to proxy to a sample validation service based on Okta.

Logical Flow:

API_Request(client_token,api_params) --->  Web-Tier::intercepting_filter --->  https://security_svc(client_token):user_context
                                                     |
                                                     |
                                            req_header:user_context
                                                     |
                                                     |-------->  App_Tier_Svc(user_context, api_params):results


# Components & Dependencies


## Nginx Auth-Request


## Auth-API Project


## Rest-API Project


## OpenID Connect (oidc)
Okta.Com Dev Account
https://oidcdebugger.com/debug


## Client Request


##  References
http://nginx.org/en/docs/http/ngx_http_auth_request_module.html
https://docs.nestjs.com/
https://developer.okta.com/docs/guides/validate-id-tokens/overview/
https://oidcdebugger.com/debug




## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Dipesh Patel](https://www.linkedin.com/dipeshpate)

## License

  Nest is [MIT licensed](LICENSE).
