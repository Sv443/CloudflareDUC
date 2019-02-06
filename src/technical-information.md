
# CloudflareDUC (v0.1_alpha) by [Sv443](https://sv443.net/) - Information for Developers<br>[![](https://img.shields.io/github/license/Sv443/CloudflareDUC.svg?style=flat-square)](https://github.com/Sv443/CloudflareDUC/blob/master/LICENSE) ![](https://img.shields.io/badge/documentation-full-green.svg?style=flat-square) [![](https://img.shields.io/github/issues/Sv443/CloudflareDUC.svg?style=flat-square)](https://github.com/Sv443/CloudflareDUC/issues) [![](https://img.shields.io/github/stars/Sv443/CloudflareDUC.svg?style=flat-square)](https://github.com/Sv443/CloudflareDUC/)
### This document contains all technical information about the Dynamic Update Client. If you are a normal end user, please instead [read this](/readme.md)

<br><br>

---
## [Info](#info) - [Dependencies](#dependencies) - [Flow Chart](#flow-chart) 

---

<br><br><br><br><br><br><br><br><br><br><br><br><br>

# Info

- This is **not** a stable build! I haven't added much error catching and I can't guarantee that it works for you yet
- If it doesn't work, please be so kind to [submit an issue](https://github.com/Sv443/CloudflareDUC/issues) so I can resolve it as soon as possible
- This script was tested on Windows 7 Ultimate (64bit) and Windows 10 (64bit) - other QA testing will follow soon

<br><br><br><br><br><br>

# Dependencies

- dotenv v6.2.0
- http v0.0.0
- https v1.0.0
- get-my-ip v0.0.1
- svjsl v1.6.1
- xmlhttprequest v1.8.0
- yesno v0.2.0  

<br><br><br><br><br><br>

## Flow Chart

1. Send HTTP GET request to the API endpoint to get the zone identifier
2. Use the zone identifier to send a GET request to the API endpoint to get all DNS identifiers as an array
3. Get the origin server's own IP on an interval using the public-ip package
4. Ping the Cloudflare domain on an interval using the xmlhttprequest package
5. If the origin server doesn't respond or give a 500-600 error, send a PUT request to the API endpoint with both identifiers and the Cloudflare tokens inside the .env file to update all records
6. 4xx error means the origin server is online and the DNS record points to the right direction but the specified document wasn't found or the origin server returned an error which is still fine
7. If `CTRL+C` is pressed, the yesno package will be called to have the user confirm the shutdown to prevent accidental closing