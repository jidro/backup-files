# `ChatGPT`

## 中文说明：

执行涉及理解或生成自然语言或代码的任务。

### 综述：

这个插件集成了 `OpenAI` 开发的基于 `AI` 的聊天机器人 `ChatGPT`。

使用该插件，可以得到准确的答案，问题，快速查找信息，生成文本，甚至得到构建在 `ONLYOFFICE` 编辑器的权利。

`ChatGPT` 可以在涉及处理自然语言的响应中执行多项任务：

- 基于查询的文本生成；

- 根据输入预测和完成文本；

- 问题回答；

- 翻译；

- 文本摘要和结构；

- 情绪分析；

- 谈话式的交流。

### 如何使用：

- 从 [`OpenAI`](https://openai.com/api/) 获得一个 `API` 密钥。**请注意: `ChatGPT` `API` 是一个付费功能。**

- 在 `ONLYOFFICE` 编辑器中打开 `Plugins` 选项卡，选择 `ChatGPT`，然后输入 `API Key`。

- 在文本字段中以自由格式写入问题，然后单击“提交”。

- `ChatGPT` 将处理请求并在文档中以纯文本形式插入响应。

#### 举例说明：

讲讲开源软件的简史。

创建一个具有真实的纽约空气湿度数据表的 `HTML` 代码，突出显示列和标题。

创建一个绿色的随机图片的 `HTML` 代码。

生成一个小型街机游戏的 `JavaScript` 代码。

给冰淇淋店写个宣传标语。

#### 附加设置：

`Model` — 用于处理请求的人工智能模型。

`Maximum length` — 应答中使用的最大响应标记数。令牌是系统用来估计文本体积的一批字符。

温度定义了输出中存在多少随机性，即 `ChatGPT` 做出的不常见的“创造性”决策的数量。

`Top P` — 定义随机性的另一种方法。影响答案中的单词抽样，其中`1`将给出最常用的单词，`0`将给出最不常用的结果。

`Stop sequences` — 定义像 `ChatGPT` 的停止字一样工作的文本信息。

### 如何安装：

#### 服务器和云解决方案：

通过内置的插件管理器在编辑器中安装插件，一键安装。

#### 桌面版解决方案：

- 存档插件文件(必须包含 `config.json`、 `index.html` 和 `pluginCode.js`)。

- 将文件扩展名更改为 `.plugin`。

- 转到 `Plugins` 选项卡，单击 `Settings` -> `Add plugin`，浏览 `.plugin` 文件。

## English instructions：

Perform tasks which involve understanding or generating natural language or code.

### Overview

The plugin integrates an AI-based chatbot called ChatGPT developed by OpenAI. Using it, you are able to get accurate answers to your questions, quickly find information, generate texts, and even get your code built right in ONLYOFFICE editors.

ChatGPT can perform multiple tasks within responses that involve processing natural language:

- Text generation based on inquiries;
- Predicting and finishing pieces of text based on the input;
- Question answering;
- Translation;
- Text summarization and structuring;
- Sentiment analysis;
- Conversation-style communication.

### How to use

- Obtain an API Key from [OpenAI](https://openai.com/api/). Please note: ChatGPT API is a paid feature.
- Open the Plugins tab in ONLYOFFICE editors, select ChatGPT, and enter your API Key.
- Write your message in a free form in the text field and click Submit.
- ChatGPT will process the request and insert the response in your document in plain text.

#### Request examples

Tell me a brief history of open-source software.

Create HTML code for a table with real air humidity data in New York, highlight the columns and the headers.

Create HTML code for a random picture with green color present.

Generate a JavaScript code for a small arcade game.

Write a tagline for an ice cream parlor.

#### Additional settings

Model — an AI model to use for processing your request.

Maximum length — a maximum number of response tokens to use in the answer. Tokens are batches of characters that the system uses to estimate the volume of text.

Temperature defines how much randomness is present in the output, i.e. the amount of uncommon, “creative” decisions made by ChatGPT.

Top P — an alternative way of defining the randomness. It affects the word sampling in the answer, where 1 will give you the most commonly used words, and 0 will give the least common results.

Stop sequences — defines the text information that will work like a stop word for ChatGPT.

### How to install

#### For server and cloud solutions

Install the plugin via the built-in Plugin Manager right in the editors with one click.

#### For desktop editors

- Archive the plugin files (it must contain config.json, index.html, and pluginCode.js).
- Change the file extension to .plugin.
- Go to the Plugins tab, click Settings >> Add plugin, browse for the .plugin file.


