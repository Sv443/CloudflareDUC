# <img src="https://sv443.net/cdn/cfduc/icon_100x100.png" style="width: 40px; height: 40px;"> CloudflareDUC (closed beta 0.6) by [Sv443](https://sv443.net/) <br> [![](https://img.shields.io/github/license/Sv443/CloudflareDUC.svg)](https://sv443.net/LICENSE) [![](https://img.shields.io/github/issues/Sv443/CloudflareDUC.svg)](https://github.com/Sv443/CloudflareDUC/issues/new) [![](https://img.shields.io/github/stars/Sv443/CloudflareDUC.svg)](https://github.com/Sv443/CloudflareDUC/stargazers)
## An easy to use Dynamic Update Client for Cloudflare that only needs minimal configuration

<br><br><br>

# [Download the latest stable build here](https://github.com/Sv443/CloudflareDUC/blob/master/stable/CloudflareDUC%20(v0.2_alpha).zip?raw=true)
(Note: Windows Defender could warn you because I can't get a license for the application. Please ignore this warning or run the source code with Node.js if you don't trust me)
<br><br><br><br><br>


## I don't earn any money from this so if you like CloudflareDUC, please consider donating to support further development:<br>[ [Patreon](https://www.patreon.com/bePatron?u=19140397) - [Ko-fi](https://ko-fi.com/Sv443_) - [PayPal](https://paypal.me/SvenFehler) ]
### Thanks :)





<br><br><br><br><br>







# Menu:

- [Installation](#installation)
    - [Before you start](#before-you-start)
    - [Step by step guide](#step-by-step-guide)
    - [Configuration explained step by step](#configuration-explained-step-by-step)
- [How it works](#how-it-works)
- [How to report bugs](#how-to-report-bugs)
- [Technical Information](./src/Technical%20Information.md)

---

<br><br><br><br><br><br><br><br><br><br><br><br><br>

[▲ Back to Menu](#menu)
# Installation:

## Before you start:
- This is a **relatively** stable build but still pretty unstable. I can't guarantee that it works for you yet though it can't possibly do any damage beyond assigning the wrong IP address to your DNS record(s).
- I haven't done too much quality assurance yet - that will be done once I make a very stable full release. All (pre-)releases are tested and in service 24/7 on my own server though.


<br><br>

## Step by step guide:
1. Extract the executable file from inside the ZIP file you downloaded to a folder of your liking
2. Run the executable file once to generate all necessary configuration files
3. Open the `.env` file with any text editor (if you can't find it, follow [this tutorial](https://kb.wisc.edu/page.php?id=27479) so you can this hidden file)
4. Go to your Cloudflare account page and click the button named "View" in the "Global API Key" column under the section "API Keys > Global API Key" - this button is framed in red in this example:<br><br>
![](https://sv443.net/cdn/cfduc/apikeys.png)<br>
5. Enter your password and solve the captcha and then copy the key to the respective column in the `.env` file
6. Enter your account's E-Mail address in the other column of the `.env` file
7. IMPORTANT! Make sure NOBODY has access to the `.env` file and make sure to protect its contents like a password! If you accidentally published it somewhere, go to your account's dashboard (see step 4) and click the "Change" button to re-generate the token. This makes sure that everyone who might have had access to your account now doesn't anymore.
8. Save the `.env` file and close it
9. Open the `settings.cfg` file and follow the instructions inside to configure CloudflareDUC to your liking. If you don't understand something, go to [this section](#configuration-explained-step-by-step)
10. Save the file and close it  
  
... and you are done! Now just use the executable file to start CloudflareDUC and give it a little time to start up (shouldn't take longer than half a minute) and let it keep running to have it automatically update the DNS records.  
To shut it down either press <kbd>^C</kbd> (Control + C) or just close the window.  
If you change anything in the `settings.cfg` or `.env` file, make sure to restart the application completely.  
<br>
## If you encounter any bugs or want me to add more features, please check out [this section](#how-to-report-bugs). Thanks :)

<br><br><br><br><br>

[▲ Back to Menu](#menu)
# How it works:

1. A request is being sent to the Cloudflare API to find out all of your Cloudflare registered domains and the config is checked to find out which of those is the one that should be updated
2. A second request is being sent to the API to get all the DNS records that you have added to the domain
3. Your public IP address is being read on an interval and saved so it can be used to update the DNS record(s) in step 4
4. The above values (steps 1-3) were all saved in order to send an update request to update the DNS record(s) with the new IP address
5. An interval starts that pings the specified URL. If a 5xx error is being returned, the application knows that your origin server is not available anymore which usually means that the DNS record(s) is/are not up to date anymore. This will send an update request like mentioned in step 4
6. Now the script continues with the interval until it gets a 5xx error again, in which case it will jump to step 4




<br><br><br><br><br>

[▲ Back to Menu](#menu)
# Configuration explained step by step:
## Coming Soon - you will have to deal with the comments inside the file for now, sorry :/


<br><br><br><br><br>

[▲ Back to Menu](#menu)
# How to report Bugs:

No matter which one of the following methods you choose, please provide as much information for me as possible (steps to reproduce, detailed error logs, content of the log files in the "logs" folder, etc. ).
- The main way to report a bug is through the GitHub issue tracker which you can find [here](https://github.com/Sv443/CloudflareDUC/issues/new)
- If you don't have a GitHub account or prefer contacting me through Discord, please click [here](https://discord.gg/aBH4uRG) to get invited to my Discord server where you can submit the bug report as well (please use the #quick-support channel)
- If you have neither of those or you prefer the traditional way, you can also send an E-Mail to this address: [sven.fehler@web.de](mailto:sven.fehler@web.de)