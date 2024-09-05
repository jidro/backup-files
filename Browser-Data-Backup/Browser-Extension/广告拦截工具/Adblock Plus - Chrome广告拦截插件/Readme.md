# 插件安装说明： 

最全的Chrome插件安装方法! 解决 CRX_HEADER_INVALID

## 前言

近期大量用户下载或安装插件扩展时，遇到如下错误。

无法从该网站添加应用、扩展程序和用户脚本无法从该网站添加应用、扩展程序和用户脚本

或者

程序包无效 CRXHEADERINVALID 错误程序包无效 CRX_HEADER_INVALID

原因是Chrome更新时，改变了头部信息打包方式！    
导致的老版本Chrome打包的crx插件，无法直接安装在新版本Chrome中

举个例子,开发人员在2018年3月用chrome68把他写的插件打包成crx文件.    
此时用户也用chrome68,一切正常安装使用.    
等到chrome73发布的时候,头部打包方式就大改版了    
用户再安装"chrome68打包的crx"就会出现CRX_HEADER_INVALID错误    

这就说明这个插件不适合直接拖动安装    
> 解决方法一种就是要求作者用新版的chrome73再打包一次重新发布    

> 或者可以用下文会提到的方法2暴力安装或方法3商店直装来解决问题

> 补充一下:判断的方法.看收录时间

> **基本上收录这个插件的时间在2019年4月以及之前的,多半就是不能直接拖动安装的**

## 正文    
关于新版Chrome 安装扩展插件方法汇总（任选一种即可）

### 一、 拖动安装(推荐)
（一般更新日期比较近的，基本可以适用于此方法）

在地址栏输入 chrome://extensions/ 打开 开发者模式 的开关拖动 xxx.crx 文件到Chrome中间即可

按住 xxxxxx.crx 拖动到chrome扩展中心拖动安装

弹出安装确认的提示框，说明操作成功，点击确定即可安装成功

### 二、 暴力安装
（不太推荐此方法，如果方法1拖动安装无效的情况下，可以尝试暴力安装）

把下载好的xxx.crx 的扩展名改为 xxx.zip

在地址栏输入 chrome://extensions/打开 开发者模式 的开关拖动 xxx.zip 文件到Chrome中间即可

按住 xxxxxx.zip 拖动到chrome扩展中心拖动安装

安装完成后会直接看到，打开插件开关即可拖动安装

该方法大部分情况下可以一次成功，个别时候会收到浏览器安全提醒，忽略即可

### 三、 商店直装
（此方法首先需要能连上谷歌Chrome商店！！！）
目前本站已经收录了多款帮助用户直连谷歌商店的插件，可任选一个，并用前文方法安装

> [PP谷歌访问助手](https://chrome.zzzmh.cn/info?token=kahndhhhcnignmbbpiobmdlgjhgfkfil)

> [集装箱](https://chrome.zzzmh.cn/info?token=kbgigmcnifmaklccibmlepmahpfdhjch)

> [谷歌访问助手](https://chrome.zzzmh.cn/info?token=gocklaboggjfkolaknpbhddbaopcepfp)

> [谷歌学术助手](https://chrome.zzzmh.cn/info?token=jkicnibdkfemnfhojeajbldjgdddpajk)

> [谷歌服务助手](https://chrome.zzzmh.cn/info?token=cgncbhnhlkbdieckbbmeppcefokppagh)

> [谷歌上网助手](https://chrome.zzzmh.cn/info?token=nonmafimegllfoonjgplbabhmgfanaka)

这里你必须先想办法安装上上述中的任意一个直连谷歌的插件，使用前文所述的方法1拖动安装或方法2暴力安装，安装成功其中一个能直连谷歌的插件,然后打开[谷歌商店](https://chrome.google.com/webstore)检查是否成功,能正常打开就说明成功
注意:该方法速度较慢是正常情况，但如果出现404无法访问，说明安装谷歌服务的插件有问题并没有成功,建议删除后,换一个再试.

上述步骤安装成功以后，随便到任意一个插件详情页面，都有一个红色按钮叫谷歌商店 如图商店直装

进入到谷歌商店插件详情页,直接点击添加至Chrome 开始安装即可开始安装商店直装

看到弹出框说明即将安装成功，点击添加扩展程序即可商店直装

END
