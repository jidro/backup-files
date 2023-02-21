# 概述

Adds code intelligence to GitHub, GitLab, and other hosts: hovers, definitions, references.     
For 20+ languages.    
The open-source Sourcegraph extension adds code navigation and code intelligence to GitHub, GitHub Enterprise, GitLab, Bitbucket Server and Phabricator.

•  Code intelligence on your code host:
* Hover tooltips with documentation and type information    
* Go to definition    
* Find references

•  Integrations with third-party services like Codecov coverage overlays, open-in-editor buttons and many more with Sourcegraph extensions

•  Browser shortcut (src + Space) that performs the search on your Sourcegraph instance 

It works for 20+ languages on public and private code on popular code hosts (see below).

## MAKE IT WORK ON YOUR CODE HOST:

•  GitHub - No action required. Your extension works here by default.
•  GitHub Enterprise, GitLab, Bitbucket Server and Phabricator - grant additional permissions in the extension menu

[Browser extension docs](https://docs.sourcegraph.com/integration/browser_extension)

## MAKE IT WORK FOR PRIVATE CODE:

To use the browser extension with your private repositories, you need to set up a private Sourcegraph instance and connect it to the extension.

[Installation docs](https://docs.sourcegraph.com/admin/install)


## WHERE TO START?
After adding the extension you install it, try it out on any of these public repositories:

•  [Go](https://github.com/gorilla/mux/blob/9e1f59/mux.go or https://github.com/dgrijalva/jwt-go/pull/152/files#diff-f615844d3497ff38db57e459d6ef657bL48)

•  [Java](https://github.com/google/guava/blob/581ba1/guava/src/com/google/common/collect/ImmutableList.java)

•  [TypeScript](https://github.com/angular/angular/blob/a2878b/packages/benchpress/src/reporter/console_reporter.ts or https://github.com/sindresorhus/got/pull/917/files#diff-02301bc46e8b878f10e9a8339efb7de7R176)

•  [C#](https://github.com/paiden/Nett/pull/76/files#diff-e969e1315b2cb01bab80b2860be0d87eR52)

•  [Python](https://github.com/ageitgey/face_recognition/blob/b8fed6/examples/facerec_on_raspberry_pi.py)

[This extension is open source](https://github.com/sourcegraph/sourcegraph/tree/main/client/browser)