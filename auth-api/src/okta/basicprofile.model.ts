import { Url } from "url";

/**
 * BasicProfile based on client access token
 */
export class BasicProfile {
    active: boolean;
    scope: string;
    ver: number;
    username: string ;
    exp: number;
    iat: number;
    sub: string;
    aud: string;
    iss: Url;
    jti: string;
    token_type: string;
    client_id: string;
    uid: string;
    upn: string;
    group: Array<string>;

    constructor(private readonly jwtClaim: any) {
        if (jwtClaim) {
            this.active = true;
            this.ver = jwtClaim.ver;
            this.jti = jwtClaim.jti;
            this.iss = jwtClaim.iss;
            this.aud = jwtClaim.aud;
            this.iat = jwtClaim.iat;
            this.exp = jwtClaim.exp;
            this.client_id = jwtClaim.cid;
            this.uid = jwtClaim.uid;
            this.scope = jwtClaim.scp;
            this.sub = jwtClaim.sub;
            this.upn = jwtClaim.upn;
            this.group = jwtClaim.groups;
        }
    } ;
}
