# 小米/红米`AC2100`刷`Openwrt`方法

`Openwrt`官方已经从`21.02.0`版正式支持小米/红米`AC2100`。

[官网下载地址](https://downloads.openwrt.org/releases/)

> 更新说明：
> 
> 因为采用了`DAS`构架，从`19`升级要强制，而且以前的设置备份无法用。
> 
> 注意从`openwrt`写盘，盘名不一样了。

从openwrt写盘命令：

```shell
mtd write /tmp/xxx-kernel1.bin kernel
mtd -r write /tmp/xxx-rootfs0.bin ubi
```

从小米厂家rom写盘命令：

```shell
mtd write /tmp/xxx-kernel1.bin kernel1
mtd -r write /tmp/xxx-rootfs0.bin rootfs0
```

注意上面根据自己的文件名做相应更改。

----------------------------------------------------------------------

这也是之前刷机的记录，参考了恩山论坛`a76yyyy`等归纳的方法而实践。

**1. 基本思路：** 利用官方固件的漏洞，通过`Web`注入漏洞开启`SSH`实现刷机。

**2. 材料准备：** 有两方面的内容准备，带漏洞的`rom`和`Openwrt rom`。

**第一方面：** 

带漏洞的官方固件，只有一个版本的固件有漏洞，版本号为`AC2100 2.0.7*`版本。

之后的版本漏洞已经修复，要刷机需降级到带漏洞的版本。

> 有人说是小米有意无意放出的那么一个版本，
> 
> 反正国际上一大堆玩小米路由的玩家

降级只需用官方更新方法手动刷入即可。

带漏洞的版本在官方网站上下载：

- [红米RM2100](http://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/rm2100/miwifi_rm2100_firmware_d6234_2.0.7.bin)

- [小米R2100](http://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/r2100/miwifi_r2100_firmware_4b519_2.0.722.bin)

**第二方面：** 

需刷入的`Openwrt rom`。

有各种各样的版本，用了一个半官方的由`Philipp Schuster`等适配编译的版本，

目前还在适配开发阶段，据他说估计要到下一个版本号才会签升为`Openwrt`官方版。

> 已经签升为官方版，从21.02.0版起支持，如下早期版本无更新了。

[下载地址](https://drive.google.com/drive/u/0/folders/1WTWvOp-6B54hsCDpuo_hf2JKAaUwmZFG)

开发讨论的论坛地址：

[New Xiaomi Router AC2100​forum.openwrt.org/t/new-xiaomi-router-ac2100/48101](https://forum.openwrt.org/t/new-xiaomi-router-ac2100/48101)

有一大帮国际玩家云集，Schuster版本地址也在那里。

只需三个文件如：

- `openwrt-ramips-mt7621-xiaomi_mi-router-ac2100-squashfs-kernel1.bin`

- `openwrt-ramips-mt7621-xiaomi_mi-router-ac2100-squashfs-rootfs0.bin`

- `openwrt-ramips-mt7621-xiaomi_mi-router-ac2100-squashfs-sysupgrade.bin`

先刷入前面两个文件，之后用`sysupgrade.bin`更新一下即可。

**3. 漏洞注入：** 

降级到漏洞版本后，通过下面`web`命令开启`SSH`。

3.1 使用管理密码登录管理页面，登录后地址栏链接应为：

```shell
http://192.168.31.1/cgi-bin/luci/;stok=<STOK>/web/home#router
```

这里的关键是 **`<STOK>`** 号，每台机器不同，甚至每次登录都不同，拷贝下来备用。

3.2 在浏览器地址栏中输入以下链接代码，注意替换掉`<STOK>`部分：

```shell
http://192.168.31.1/cgi-bin/luci/;stok=<STOK>/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3B%20nvram%20set%20ssh_en%3D1%3B%20nvram%20commit%3B%20sed%20-i%20's%2Fchannel%3D.*%2Fchannel%3D%5C%22debug%5C%22%2Fg'%20%2Fetc%2Finit.d%2Fdropbear%3B%20%2Fetc%2Finit.d%2Fdropbear%20start%3B
```

返回`{"code":0}`即代表成功，若返回401错误，

原因可能是版本不正确或者`<STOK>`值错误或者链接输入不完整等。

`root`密码请自行根据`SN`计算；

不想计算的或不知道怎么计算的，可以更改管理员`root`密码的方式得到（此法更方便）。

3.3 更改管理员`root`密码的方法：

通过如下命令更改`roo`t密码为`admin`，在浏览器地址栏中输入以下链接代码，注意替换掉 **`<STOK>`** 部分

(有时`stok`值会发生改变，建议重新返回登录页面复制最新的`stok`值)：

```shell
http://192.168.31.1/cgi-bin/luci/;stok=<STOK>/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3B%20echo%20-e%20'admin%5Cnadmin'%20%7C%20passwd%20root%3B
```

重启即可开启`SSH`，建议一键注入后需等待一些时间，

保证路由器后台能正确处理注入信息后再重启。

**4. 登录`SSH`进行刷机：**

4.1 重启后，通过`winscp`登录`192.168.31.1`用户为`root`密码为刚才改过的`admin`。

先把`openwrt`的两个`rom`文件（`xxx-kernel1.bin`和`xxx-rootfs0.bin`）上传到路由器`tmp`目录。

4.2 再用`putty`登录`192.168.31.1`进行刷机操作，

输入如下命令进行刷机：

```shell
nvram set uart_en=1&&nvram set bootdelay=5&&nvram set flag_try_sys1_failed=1&&nvram commit
mtd write /tmp/xxx-kernel1.bin kernel1
mtd -r write /tmp/xxx-rootfs0.bin rootfs0
```

> **注意：**
> 
> 上面`rom`文件的文件名，把`xxx`替换成自己用的`rom`文件名。

刷完后将重启，刷机大功告成，之后便是`openwrt`路由的设置了。
