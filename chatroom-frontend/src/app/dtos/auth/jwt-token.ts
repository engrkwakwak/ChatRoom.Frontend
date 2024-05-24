export default interface JwtToken {
    sub : string
    iss : string
    exp : number
    aud : string
  }