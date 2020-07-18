import MalRequest from "./request";
import { apiUrl, secondaryApiUrl } from "./api";
import { queryEncode } from "./util";
import { MalUser } from "./user";
import { MalAnime } from "./anime";
import { MalManga } from "./manga";
import { MalForum } from "./forum";
import { Forum } from "../jikan/types";

export * as User from "./user";
export * as Anime from "./anime";
export * as Manga from "./manga";
export * as Common from "./common";
export * as Forum from "./forum";

export { ResponseError, MalError } from "./request";

export class MalToken {
  token_type: string;
  expires_in: number | null;
  access_token: string;
  refresh_token: string;

  constructor(
    tokenType: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number | null
  ) {
    this.token_type = tokenType;
    this.expires_in = expiresIn;
    this.access_token = accessToken;
    this.refresh_token = refreshToken;
  }

  /**
   * **Unstable!**
   */
  static async fromCredential(
    clientId: string,
    username: string,
    password: string
  ): Promise<MalToken> {
    const req = new MalRequest([apiUrl, "/auth/token"]);
    req.method = "post";
    req.headers = { "content-type": "application/x-www-form-urlencoded" };
    req.data = queryEncode({
      client_id: clientId,
      username,
      password,
      grant_type: "password",
    });

    const token: any = await req.call();

    return new MalToken(
      token.token_type,
      token.access_token,
      token.refresh_token,
      token.expires_in
    );
  }

  static async fromRefreshToken(
    clientId: string,
    refreshToken: string
  ): Promise<MalToken> {
    const req = new MalRequest([secondaryApiUrl, "/oauth2/token"]);
    req.method = "post";
    req.headers = { "content-type": "application/x-www-form-urlencoded" };
    req.data = queryEncode({
      client_id: clientId,
      refresh_token: refreshToken,
      grant_type: "password",
    });
    const token: any = await req.call();

    return new MalToken(
      token.token_type,
      token.access_token,
      token.refresh_token,
      token.expires_in
    );
  }

  static async fromAuthorizationCode(
    clientId: string,
    code: string,
    codeVerifier: string
  ): Promise<MalToken> {
    const req = new MalRequest([apiUrl, "/auth/token"]);
    req.method = "post";
    req.headers = { "content-type": "application/x-www-form-urlencoded" };
    req.data = queryEncode({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
    });

    const token: any = await req.call();

    return new MalToken(
      token.token_type,
      token.access_token,
      token.refresh_token,
      token.expires_in
    );
  }
}

export class MalAcount {
  /** @hidden */
  private clientId: string;
  /** @hidden */
  malToken: MalToken;

  constructor(clientId: string, malToken: MalToken) {
    this.clientId = clientId;
    this.malToken = malToken;
  }

  /** @group Methods */
  user: MalUser = new MalUser(this);
  /** @group Methods */
  anime: MalAnime = new MalAnime(this);
  /** @group Methods */
  manga: MalManga = new MalManga(this);
  /** @group Methods */
  forum: MalForum = new MalForum(this);

  async refreshToken(): Promise<MalAcount> {
    this.malToken = await MalToken.fromRefreshToken(
      this.malToken.refresh_token,
      this.clientId
    );
    return this;
  }
}

export class Api {
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  loadToken(token: MalToken) {
    return new MalAcount(this.clientId, token);
  }

  getOauthUrl(codeChallenge: string) {
    const base = "https://myanimelist.net/v1/oauth2";
    return `${base}/authorize?response_type=code&client_id=${this.clientId}&code_challenge_method=plain&code_challenge=${codeChallenge}`;
  }

  async refresh(refreshToken: string): Promise<MalAcount> {
    const malToken = await MalToken.fromRefreshToken(
      this.clientId,
      refreshToken
    );
    return new MalAcount(this.clientId, malToken);
  }

  async authorizationCode(
    code: string,
    /** it is actually a `code_verifier` but mal accepts code_challenge here instead */
    codeChallenge: string
  ): Promise<MalAcount> {
    const malToken = await MalToken.fromAuthorizationCode(
      this.clientId,
      code,
      codeChallenge
    );
    return new MalAcount(this.clientId, malToken);
  }

  // async authorizationCode(refreshToken: string): Promise<MalAcount> {}

  /**
   * Undocumented Endpoints, those can disperse at any moment
   */
  unstable = {
    /**
     * ### Login to API using login and password `(Unstable!)`
     *
     * This endpoint makes the whole idea of OAuth API pointless, so it will probably be removed soonish
     *
     * Example of paradox related to this endpoint is that you can use someone's app id to get access to API.
     * So basically it allows you to go around API request limits
     *
     * `(works reliably since 2018)`
     */
    login: async (username: string, password: string): Promise<MalAcount> => {
      const malToken = await MalToken.fromCredential(
        this.clientId,
        username,
        password
      );
      return new MalAcount(this.clientId, malToken);
    },
  };
}

export function api(
  clientId: string = "6114d00ca681b7701d1e15fe11a4987e"
): Api {
  return new Api(clientId);
}
