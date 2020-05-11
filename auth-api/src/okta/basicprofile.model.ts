import { Url } from "url";

/**
 * BasicProfile based on client access token
 */
export class BasicProfile {
    active: boolean;
    scope: string;
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
}
