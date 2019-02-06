
# [![](icons/icon_100x100.png)](https://github.com/Sv443/CloudflareDUC/) CloudflareDUC (v0.2_alpha) by [Sv443](https://sv443.net/)<br>[![](https://img.shields.io/github/license/Sv443/CloudflareDUC.svg?style=flat-square)](https://github.com/Sv443/CloudflareDUC/blob/master/LICENSE) ![](https://img.shields.io/badge/documentation-full-green.svg?style=flat-square) [![](https://img.shields.io/github/issues/Sv443/CloudflareDUC.svg?style=flat-square)](https://github.com/Sv443/CloudflareDUC/issues) [![](https://img.shields.io/github/stars/Sv443/CloudflareDUC.svg?style=flat-square)](https://github.com/Sv443/CloudflareDUC/)
### An easy to use Dynamic Update Client for Cloudflare that only needs minimal configuration

<br><br>

# [Download](https://github.com/Sv443/CloudflareDUC/raw/master/compiled/CloudflareDUC%20(v0.2_alpha)%20by%20Sv443.zip)
(Note: Windows Defender will probably warn you because I can't get a license for the exe. Please ignore this warning or clone the repository and run it with Node instead)
<br><br><br><br>


# Menu:

## [Installation](#installation) - [How it works](#how-it-works) - [Issues](https://github.com/Sv443/CloudflareDUC/issues) - [Technical Information](https://github.com/Sv443/CloudflareDUC/blob/master/src/technical-information.md)

---

<br><br><br><br><br><br><br><br><br><br><br><br><br>

# Installation

## Before you start:
- This is **not** a stable build! I haven't added much error catching and I can't guarantee that it works for you yet
- I haven't done much quality assurance yet - that will be done once I make a stable release

1. [Download](#download-exe) the ZIP file which contains the `.bat` to run it and both a `.env` and a `.cfg` file in the `src` folder
2. Extract all files inside the ZIP to a folder of your liking
3. Open the `.env` file in the `src` folder with any text editor
4. Go to your Cloudflare account page and click the two view buttons under the section "API Keys"
5. Copy the keys to the respective column in the `.env` file (Global API key to column 1 and Origin CA key to column 2)
6. Enter your account's E-Mail in the third column
7. IMPORTANT! Make sure NOBODY has access to the .env file and make sure to protect its contents like a password! For example, add a .gitignore like I did to be 100% sure it won't land on any GitHub repo.
8. Save the `.env` file and close it
9. Open the `settings.cfg` file and change the first attribute (hosturl) to your full domain (example: `https://www.google.com/`)
10. (Optional) adjust the interval (higher = lower bandwidth usage but also higher downtime - lower = higher bandwidth usage but also lower downtime) - recommended is 300 (every 5 minutes)
11. (Optional) adjust the timeout (bad internet connection = higher - good internet connection = lower) - recommended is 5
12. Make sure not to change the verification value as that would prevent the application from starting up
13. Save the file and close it  

... and you are done! Now just start the `.bat` file and give it a little time to start up (shouldn't take longer than a minute) and let it keep running to have it automatically update the DNS records.  
To shut it down either press <kbd>^C</kbd> or just close the window to instantly shut it down.  
If you change anything in the `.cfg` or `.env` file, make sure to restart the application.  
<br>
## If you encounter any bugs or want me to add more features, please visit [this link](https://github.com/Sv443/CloudflareDUC/issues) and open a new issue and I will fix/add it as soon as possible. Thanks :)

<br><br><br><br><br>

# How it works

1. A GET request is being sent to the Cloudflare API zone endpoint at "https://api.cloudflare.com/client/v4/zones" - this is used to get the Zone_ID of the DNS endpoint
2. A second GET request is being sent to the DNS endpoint at "https://api.cloudflare.com/client/v4/zones/Zone_ID_from_above/dns_records/" to determine the DNS_Identifiers of the DNS records
3. These values are all being saved in order to send a PUT request to "https://api.cloudflare.com/client/v4/zones/Zone_ID_from_above/dns_records/DNS_Identifier_from_above" to update the DNS record(s) with the new IP address
4. The above mentioned own public IP address is being updated every five seconds to be up to date at all times
5. An interval starts that pings the specified URL. If a 5xx error is being returned, the application knows that your DNS record(s) is/are not up to date anymore and will send the PUT request mentioned above to update your DNS records
6. Now the script continues with the interval until it gets a 5xx error again
