

const parseJWT = (token) => {
  if (!token) {
    return;
  } else {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(window.atob(base64));
  }
}

export default parseJWT