# Purpose
In an architecture built on trust between controlled systems, there is value of centralizing security controls inside the web tier of a micro-services architecture.  The alterantive is a de-centralized model where security controls are dupliciated across the various tiers leading to support and maintenace complexities, inefficient use of resources, performance lag, and security risks.  This is required in an architecture built on low trust between controlled systems.

For this scope, the assumption is the archirecture is built on trust between the web, application, and the data tiers, all tightly controlled systems.

## Forces

#  As application architecture evolves with new services or product lines, there needs be a way to independently manage, support, and maintain security controls without creating impediments to new featur and compromising risks.

#  Decouple security processes and management from downstream application functions.  This leads to loose coupling and higher cohesion as authentication & authorization, security workflow, audiability and other security tasks can be centrally managed without impact to other parts of the architecture.

#  Security technology and business processes will evolve as new authentication and authorization workflows are indentified.  This is driven not only by technology change but driven by business needs as well.  The respective systems need to evolve in a flexibility, independent manner.

#  As application architecture grows with more customer load, the security and application services should not become a bottleneck, especially for cloud based implementation.

#  The security system should maintain consistent performance and response times for customer requests

#  The security system should provide an way to easy to run audit for vulnerability checks, review secuirty workflows and algorithms, and enable security observability for alerts and threat monitoring.

#  System should be built on automation for faster diagnostics, scale and extensibility.


## Solution

Designg and implement an intercepting filter inside the web tier to centrally enforce security controls for every protected application service requests.  The component can integrate with security service API that is responsible for client token validation, audit, product level authorization, as well as providing context information for downstrea services.  If security checks fail, the intercepting filter will reject client request with 4XX status code.  If security chcecks pass, the intercepting filter will allow api request to flow through with client entity context information.

By centralizing security functions inside this web server, extensibility, loose coupling, and high cohesion can be achieved without impacting other parts of the architecture.  Similarly, as other parts of the archiecture evolves, it can be done without tight depenency on security inside the web-tier.

Scale concerns are also addressed by designing stateless securty services with auto-scaling.  This not only addreses issues of high load, but addresses issues of capacity planning and efficient use of resources for cost management by using ephemeral services.

Observability, auditability and ease of diagnostics is also easily achieved since these functions are in one place as opposed to distributed across many downstream systems.  And this becomes critical for production systems where speed to diagnostics and resolution matters in order to minimize business impact.

Most modern web servers, apache and nginx, provide modules for intercepting filters that can proxy to security services API or integrate with local, in-memory implementation.  For this design, intercenting filter will be configured to proxy to a sample validation service built using Okta IdP.

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
