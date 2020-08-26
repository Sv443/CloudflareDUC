# CloudflareDUC
[![](https://img.shields.io/github/license/Sv443/CloudflareDUC.svg?style=flat-square)](https://github.com/Sv443/CloudflareDUC/blob/master/LICENSE) [![](https://img.shields.io/github/issues/Sv443/CloudflareDUC.svg?style=flat-square)](https://github.com/Sv443/CloudflareDUC/issues) [![](https://img.shields.io/github/stars/Sv443/CloudflareDUC.svg?style=flat-square)](https://github.com/Sv443/CloudflareDUC/)
### An easy to use Dynamic Update Client for Cloudflare that only needs minimal configuration


<br><br><br>


## Table of Contents:

- **[Installation](#installation)**
    - [Generating an API Token](#generating-an-api-token)
- **[Troubleshooting](#troubleshooting)**
- **[Legal Information](#legal-information)**

---


<br><br><br>


## Installation:

1. [Download the latest version here.](/releases#TODO:) Alternatively, clone or download the source code and run it with the command `node .`
2. Start the executable in a terminal that has a stdin and stdout
3. Enter your E-Mail address and API token. Important: Please read the ["Generating an API Token"](#generating-an-api-token) section on how to do this
4. Choose which domains and DNS records you want to be updated in the main menu

If you want the process to run in a stdin-less terminal or want it to run in the background, you can start it with the argument `--nogui` or `-n`


<br><br><br>


### Generating an API Token:

There's two ways to generate an API token with which CF-DUC can update your domain records.  
- **There's the easy way,** where you could just use your Global API Key located in your account's settings but note that this will give CF-DUC access to your entire account and all of your domains and their features and might allow a hacked version of CF-DUC to break your entire account.
- **But there's also the correct way, which I recommend,** where you need to generate a custom API Token. This is how you do it:
    1. Go to your account settings and click on the tab "API Tokens"
    2. Under the section "API Tokens", click the button that says "Create Token"
    3. Scroll all the way down and click the button "Get Started" next to the option "Create Custom Token"
    4. Set all options like shown in this picture:  
      
    ![API Token Options](https://cdn.sv443.net/cfduc/api-token.png)


<br><br><br>


## Troubleshooting:

- **Domain(s) or Record(s) are not showing up in CF-DUC**  
      
    This is probably because you have entered wrong login information or your API token doesn't have the right permissions.  
    In this case, use the option <!-- TODO: -->"Reconfigure" in the main menu of CF-DUC.  
    Then make sure you enter the E-Mail address of an account that has read and write access to the domain(s) and/or record(s) you want to be supervised.  
    Make sure the API token is generated just as the ["Generating an API Token"](#generating-an-api-token) section states.
  
- **Xy**  
      
    Foo  
    Bar

## Legal Information:
