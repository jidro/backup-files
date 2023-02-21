# Chrome的插件扩展程序安装目录是什么？在哪个文件夹？

## 正常情况下，Chrome插件扩展程序的默认安装目录如下：

### 1.windows xp中chrome插件默认安装目录位置:  
```
C:\Documents and Settings\用户名\Local Settings\Application Data\Google\Chrome\User Data\Default\Extensions
```

### 2.windows7中chrome插件默认安装目录位置:  
```
C:\Users\用户名\AppData\Local\Google\Chrome\User Data\Default\Extensions
```
### 3.MAC中chrome插件默认安装目录位置：
```
~/Library/Application Support/Google/Chrome/Default/Extensions
```

### 4.Ubuntu中chrome插件默认安装目录位置：      
```
~/.config/google-chrome/Default/Extensions
```

## 如果在这些不同操作系统中的chrome插件默认安装位置，没有找到插件。

那么请通过下面的方式查看

### 1.地址栏输入
```
chrome:version 
```
回车

### 2.用资源管理器打开"个人资料路径"栏的路径,该路径下的Extensions文件夹即默认的扩展安装路径
