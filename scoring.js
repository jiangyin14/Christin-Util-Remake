import plugin from '../../lib/plugins/plugin.js';
import fs from 'node:fs';
import path from 'path'

const toFixedNumber = 2 //总分结果保留几位小数
const _path = process.cwd() //绝对路径

export class scoring extends plugin {
    constructor() {
        super({
            name: '[定制插件]计分',
            dsc: '计分插件',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^/pt add (\\d+(\\.\\d+)?)$',
                    fnc: 'addScore'
                },
                {
                    reg: '^/pt minus (\\d+(\\.\\d+)?)$',
                    fnc: 'reduceScore'
                },
                {
                    reg: '^/pt clear$',
                    fnc: 'clearScore'
                },
                {
                    reg: '^/pt my$',
                    fnc: 'querySelfScore'
                },
                {
                    reg: '^/pt reset$',
                    fnc: 'resetAllScore'
                }
            ]
        })
        this.scoreData = {}
    }
    async addScore() {
        if (!this.e.isMaster) { return true }
        if (!this.e.isGroup) {
            await this.e.reply(`禁止私聊使用，请在群内使用！`, true)
        }
        const scoreData = path.join(`${_path}/data`, `scoreData`)
        if (!fs.existsSync(scoreData)) {
            fs.mkdirSync(scoreData)
        }
        const groupData = path.join(`${_path}/data/scoreData`, `${this.e.group_id}`)
        if (!fs.existsSync(groupData)) {
            fs.mkdirSync(groupData)
        }
        if (!this.e.at) {
            await this.e.reply(`请@想要加分的对象！`, true)
            return true
        }
        const regex = /^\/pt add (\d+(\.\d+)?)$/
        const match = this.e.msg.match(regex)
        if (match) {
            const scoreNumber = parseFloat(match[1]);
            if (isNaN(scoreNumber)) {
                await this.e.reply(`无效的表达式，请使用正确的格式\n/pt add <数字> @[用户]`, true)
                return true
            }
            const scoreFilePath = path.join(groupData, `score.json`)
            if (!fs.existsSync(scoreFilePath)) {
                await this.e.reply(`数据写入失败，可能是没有本群的数据，请先使用/pt my初始化`, true)
                return true
            }
            const fileContent = fs.readFileSync(scoreFilePath, 'utf-8')
            const parsedData = JSON.parse(fileContent)
            const arrayData = parsedData[this.e.at]
            const existingScore = arrayData || 0
            const newScore = existingScore + scoreNumber
            this.scoreData[this.e.at] = newScore
            try {
                const jsonData = JSON.stringify(this.scoreData, null, 2)
                fs.writeFileSync(scoreFilePath, jsonData, 'utf-8')
                logger.debug(`写入数据成功！`)
            } catch (error) {
                logger.error('保存分数数据失败，错误内容:', error)
            }
            let member = await Bot.pickMember(this.e.group_id, this.e.at).getInfo()
            let userName = member.card ? member.card : member.nickname ? member.nickname : member.user_id
            await this.e.reply(`已成功为${userName}加了${scoreNumber}分，当前总分为${newScore.toFixed(toFixedNumber)}分！`, true)
            return true
        }
    }
    async reduceScore() {
        if (!this.e.isMaster) { return true }
        if (!this.e.isGroup) {
            await this.e.reply(`禁止私聊使用，请在群内使用！`, true)
        }
        const scoreData = path.join(`${_path}/data`, `scoreData`)
        if (!fs.existsSync(scoreData)) {
            fs.mkdirSync(scoreData)
        }
        const groupData = path.join(`${_path}/data/scoreData`, `${this.e.group_id}`)
        if (!fs.existsSync(groupData)) {
            fs.mkdirSync(groupData)
        }
        if (!this.e.at) {
            await this.e.reply(`请@想要减分的对象！`, true)
            return true
        }
        const regex = /^\/pt minus (\d+(\.\d+)?)$/
        const match = this.e.msg.match(regex)
        if (match) {
            const scoreNumber = parseFloat(match[1])
            if (isNaN(scoreNumber)) {
                await this.e.reply(`无效的表达式，请使用正确的格式\n/pt add <数字> @[用户]`, true)
                return true;
            }
            const scoreFilePath = path.join(groupData, `score.json`)
            if (!fs.existsSync(scoreFilePath)) {
                await this.e.reply(`数据写入失败，可能是没有本群的数据，请先使用/pt my初始化`, true)
                return true
            }
            const fileContent = fs.readFileSync(scoreFilePath, 'utf-8')
            const parsedData = JSON.parse(fileContent)
            const arrayData = parsedData[this.e.at]
            const existingScore = arrayData || 0
            if (existingScore < scoreNumber) {
                await this.e.reply(`此用户分数不足，无法减少！`, true)
                return true
            }
            const newScore = existingScore - scoreNumber
            this.scoreData[this.e.at] = newScore
            try {
                const jsonData = JSON.stringify(this.scoreData, null, 2)
                fs.writeFileSync(scoreFilePath, jsonData, 'utf-8')
                logger.debug(`写入数据成功！`)
            } catch (error) {
                logger.error('保存分数数据失败，错误内容:', error)
            }
            let member = await Bot.pickMember(this.e.group_id, this.e.at).getInfo()
            let userName = member.card ? member.card : member.nickname ? member.nickname : member.user_id
            await this.e.reply(`已成功为${userName}减少了${scoreNumber}分，当前总分为${newScore.toFixed(toFixedNumber)}分！`, true);
            return true;
        }
    }
    async clearScore() {
        if (!this.e.isMaster) { return true }
        if (!this.e.isGroup) {
            await this.e.reply(`禁止私聊使用，请在群内使用！`, true)
        }
        if (!this.e.at) {
            await this.e.reply(`请@想要清除分数的对象！`, true)
            return true
        }
        const scoreData = path.join(`${_path}/data`, `scoreData`)
        if (!fs.existsSync(scoreData)) {
            fs.mkdirSync(scoreData)
        }
        const groupData = path.join(`${_path}/data/scoreData`, `${this.e.group_id}`)
        if (!fs.existsSync(groupData)) {
            fs.mkdirSync(groupData)
        }
        const scoreFilePath = path.join(groupData, `score.json`)
        const fileContent = fs.readFileSync(scoreFilePath, 'utf-8')
        const dataJson = JSON.parse(fileContent)
        const qqNumber = this.e.at.toString()
        let member = await Bot.pickMember(this.e.group_id, this.e.at).getInfo()
        let userName = member.card ? member.card : member.nickname ? member.nickname : member.user_id
        if (dataJson.hasOwnProperty(qqNumber)) {
            delete this.scoreData[qqNumber]
            try {
                const jsonData = JSON.stringify(this.scoreData, null, 2)
                fs.writeFileSync(scoreFilePath, jsonData, 'utf-8')
                logger.debug(`写入数据成功！`)
                await this.e.reply(`${userName}的分数已被清除！`, true);
            } catch (error) {
                logger.error('保存分数数据失败，错误内容:', error)
            }
        } else {
            await this.e.reply(`${userName}没有分数记录，无需清除...`, true)
        }
        return true
    }
    async querySelfScore() {
        if (!this.e.isGroup) {
            await this.e.reply(`禁止私聊使用，请在群内使用！`, true)
        }
        if (!this.scoreData.hasOwnProperty(this.e.user_id)) {
            const scoreData = path.join(`${_path}/data`, `scoreData`)
            if (!fs.existsSync(scoreData)) {
                fs.mkdirSync(scoreData)
            }
            const groupData = path.join(`${_path}/data/scoreData`, `${this.e.group_id}`)
            if (!fs.existsSync(groupData)) {
                fs.mkdirSync(groupData)
            }
            const scoreFilePath = path.join(groupData, `score.json`)
            try {
                let scoreData = {}
                if (fs.existsSync(scoreFilePath)) {
                    const scoreFileContent = fs.readFileSync(scoreFilePath, 'utf-8')
                    scoreData = JSON.parse(scoreFileContent)
                }
                if (!scoreData.hasOwnProperty(this.e.user_id)) {
                    scoreData[this.e.user_id] = 0
                    const jsonData = JSON.stringify(scoreData, null, 2)
                    fs.writeFileSync(scoreFilePath, jsonData, 'utf-8')
                }
                const userScore = scoreData[this.e.user_id]
                await this.e.reply(`您的分数是: ${userScore}`, true)
            } catch (error) {
                logger.error('读取/写入分数数据失败，错误内容:', error)
            }
            return true
        }
    }
    async resetAllScore() {
        if (!this.e.isGroup) {
            await this.e.reply(`禁止私聊使用，请在群内使用！`, true)
        }
        if (!this.e.isMaster) { return true }
        const scoreFilePath = path.join(`${_path}/data/scoreData/${this.e.group_id}`, `score.json`)
        try {
            fs.unlinkSync(scoreFilePath)
            this.scoreData = {}
            await this.e.reply('已重置本群所有用户的分数！', true)
        } catch (error) {
            await this.e.reply('重置本群分数失败，可能是因为本群没有数据文件，请稍后再试...', true)
            logger.error('分数重置失败，错误内容:', error)
        }
        return true;
    }
}
