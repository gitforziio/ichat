var hex_to_utf8 = function (hex_string) {
    // a string like "e7be8ee7be8ee7be8ee985b1f09f9088"
    if (hex_string.length == 0) {
        return ""
    }

    var chars = []
    for (var i = 0; i < hex_string.length; i += 2) {
        var cur_hex = hex_string.substr(i, 2)
        var cur_dec = parseInt(cur_hex, 16)
        var cur_char = String.fromCharCode(cur_dec)
        chars.push(cur_char)
    }
    //convert to unicode first
    // let utf8 = require('utf8')
    let result = "";
    try {
        result = utf8.decode(chars.join(''));
    } catch(err) {
        console.debug(hex_string);
        console.debug(hex_string.length);
        console.debug(chars);
        for (let char of chars) {
            try {
                console.debug(utf8.decode(char));
            } catch(err) {
                console.debug(char);
            }
        }
    }
    return result
};

function decode_user_name_info (h_string) {
    let hex_string;
    if (h_string.substr(0, 2) == "x'") {
        hex_string = h_string.substring(2, h_string.length - 1)
    } else {
        console.debug("!!!!!!!")
    }

    // let marks = ['0a', '12', '1a', '22', '2a', '32', '3a', '42']

    var i = 0
    var all_data = {}
    while (i < hex_string.length) {
        var current_mark = hex_string.substr(i, 2)
        var data_length = hex_string.substr(i + 2, 2)
        var data_length = parseInt(data_length, 16) * 2;//hex to dec
        var hex_data = hex_string.substr(i + 4, data_length)
        if (hex_data.length == 256) {
            console.debug(h_string);
            console.debug(h_string.length);
        }
        // console.debug(hex_data);
        try {
            var utf8_data = hex_to_utf8(hex_data)
            all_data[current_mark] = utf8_data
        } catch(err) {}
        i += 4 + data_length
    }
    // console.log(all_data)
    return {
        "nickname": all_data['0a'],
        "wechatID": all_data['12'],
        "remark": all_data['1a'],
        //
        "all_data": all_data,
    }
}



var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        "current_db": {},
        "current_db_chats": [],
        "file_meta_list": [],
        "sqlite_sequence": [],
        "current_file_meta": {},
        "messages": [
            {
                "CreateTime": 1561735526,
                "Des": 0,
                "ImgStatus": 1,
                "MesLocalID": 1,
                "MesSvrID": 371430978913700350,
                "Message": "测试测试测试。",
                "Status": 2,
                "TableVer": 1,
                "Type": 1
            },
        ],
        chat_items: [],
        chat_name_dict: {},
        ui: {
            modal_open: 0,
            nav_collapsed: 1,
            alerts_last_idx: 1,
            alerts: [],
        },
    },
    computed: {
        // audio: function() {
            // let self = this;
        //     return self.$refs.audio ? self.$refs.audio : {"currentTime": 0};
        // },
        // audio_currentTime: function() {
            // let self = this;
        //     return self.audio.currentTime;
        // },
        // player_range_should_end: function() {
            // let self = this;
        //     return self.audio_currentTime*1000 >= self.player.range.end;
        // },
    },
    methods: {
        onImportNames: function() {
            let self = this;
            let fileList = self.$refs.namesdbfile.files;
            // console.log(fileList);
            let file_meta_list = [];
            let idx = 0;
            for (let file of fileList) {
                file_meta_list.push({
                    "idx": idx,
                    "name": file.name,
                    "file": file,
                    "url": URL.createObjectURL(file),
                    "content": "",
                });
                idx += 1;
            }
            self.file_meta_list = file_meta_list;
            self.current_file_meta = file_meta_list[0];
            // console.log(self.current_file_meta);
            // self.makeDB();
            self.xxx();
        },
        onImport: function() {
            let self = this;
            let fileList = self.$refs.dbfile.files;
            // console.log(fileList);
            let file_meta_list = [];
            let idx = 0;
            for (let file of fileList) {
                file_meta_list.push({
                    "idx": idx,
                    "name": file.name,
                    "file": file,
                    "url": URL.createObjectURL(file),
                    "content": "",
                });
                idx += 1;
            }
            self.file_meta_list = file_meta_list;
            self.current_file_meta = file_meta_list[0];
            // console.log(self.current_file_meta);
            self.makeDB();
            // self.xxx();
        },
        xxx() {
            let self = this;
            let reader = new FileReader();
            reader.onload = function() {
                var Uints = new Uint8Array(reader.result);
                var config = {locateFile: filename => `./dist/${filename}`};
                initSqlJs(config).then(function(SQL){
                    self.current_db = new SQL.Database(Uints);
                    self.push_alert('success', `已载入「${self.current_file_meta.file.name}」`);
                    let stmt = self.current_db.prepare("SELECT *,lower(quote(dbContactRemark)) as cr FROM Friend");
                    self.chat_items = [];
                    while (stmt.step()) {
                        let eee = stmt.getAsObject();
                        eee.nameMd5 = md5(eee.userName);
                        eee.nameInfo = decode_user_name_info(eee.cr);
                        eee.nameInfo.nameMd5 = eee.nameMd5;
                        // console.log(eee);
                        self.chat_items.push(eee);
                        self.chat_name_dict[eee.nameMd5] = eee.nameInfo;
                        //
                        if (eee.cr.length == 453) {
                            console.debug(eee);
                        }
                        //
                    };
                    stmt.free();
                });
            }
            reader.readAsArrayBuffer(self.current_file_meta.file);
        },
        makeDB: function() {
            let self = this;
            let reader = new FileReader();
            reader.onload = function() {
                var Uints = new Uint8Array(reader.result);
                var config = {locateFile: filename => `./dist/${filename}`};
                initSqlJs(config).then(function(SQL){
                    self.current_db = new SQL.Database(Uints);
                    self.push_alert('success', `已载入「${self.current_file_meta.file.name}」`);
                    let stmt = self.current_db.prepare("SELECT * FROM sqlite_sequence");
                    self.current_db_chats = [];
                    while (stmt.step()) {
                        let jjjjj = stmt.getAsObject();
                        jjjjj.chat_name = jjjjj.name;
                        let cccc = self.chat_name_dict[jjjjj.name.slice(5)];
                        jjjjj.name = cccc.remark || cccc?.nickname || cccc?.wechatID || "?";
                        // self.chat_name_dict[jjjjj.name]
                        self.current_db_chats.push(jjjjj);
                    };
                    stmt.free();
                });
            }
            reader.readAsArrayBuffer(self.current_file_meta.file);
        },
        makeMsgs: function(tb_name) {
            let self = this;
            let self_messages = [];
            // self.push_alert('info', `开始读取聊天记录「${tb_name}」`);
            let stmt = self.current_db.prepare(`SELECT * FROM ${tb_name} ORDER BY CreateTime`);
            while (stmt.step()) {self_messages.push(stmt.getAsObject());};
            stmt.free();
            // self_messages.sort((a, b) => a.CreateTime - b.CreateTime);
            self.messages = self_messages;
            self.push_alert('success', `聊天记录「${tb_name}」读取完毕！`);
        },
        getImgUrl: function(text) {
            let match = text.match(/cdnurl="[^"]+"/);
            if (match) {
                return match[0].slice(8, -1);
            } else {
                return '';
            };
        },
        getShareHtml: function(text) {
            let title = '【无标题】';
            let desc = '【无说明】';
            let url = '#';
            let type = '';
            let match = '';
            let result = '';
            //
            match = text.match(/<type>[^<>]+<\/type>/);
            if (match) {type = match[0].slice(6, -7);};
            //
            if (type=="5") {
                match = text.match(/<title>[^<>]+<\/title>/);
                if (match) {title = match[0].slice(7, -8);};
                match = text.match(/<des>[^<>]+<\/des>/);
                if (match) {desc = match[0].slice(5, -6);};
                match = text.match(/<url>[^<>]+<\/url>/);
                if (match) {url = match[0].slice(5, -6);};
                result = `<p><a href="${url}" target="_blank">${title}</a></p><p>${desc}</p>`;
            } else if (type=="6") {
                match = text.match(/<title>[^<>]+<\/title>/);
                if (match) {title = match[0].slice(7, -8);};
                result = `<p>【这是文件】</p><p>${title}</p>`;
            } else if (type=="19") {
                result = '【这是聊天记录】';
            };
            return result;
        },





        push_alert: function(cls, ctt) {
            let idx = this.ui.alerts_last_idx+1;
            this.ui.alerts.push({
                'idx': idx,
                'class': cls,
                'html': ctt,
                'show': 1,
            });
            this.ui.alerts_last_idx += 1;
            let that = this;
            setTimeout(function(){that.remove_alert(idx);},2000)
        },
        remove_alert: function(idx) {
            this.ui.alerts.filter(alert => alert.idx==idx)[0].show = 0;
        },
        onImport_OLD: function() {
            let self = this;
            let fileList = document.forms["file-form"]["file-input"].files;
            // console.log(fileList);
            let file_meta_list = [];
            let idx = 0;
            for (let file of fileList) {
                file_meta_list.push({
                    "idx": idx,
                    "name": file.name,
                    "file": file,
                    "url": URL.createObjectURL(file),
                    "content": "",
                });
                idx += 1;
            }
            self.file_meta_list = file_meta_list;
            self.current_file_meta = file_meta_list[0];
            // console.log(self.current_file_meta);
            self.makeContent();
        },
        makeContent_OLD: function() {
            let self = this;
            let reader = new FileReader();
            reader.readAsText(self.current_file_meta.file, "utf-8");
            reader.onload = function(evt) {
                self.messages = JSON.parse(this.result);
                // console.log(self.messages);
            }
        },
        markup: function(txt) {
            marked.setOptions({breaks: true});
            return marked(txt)
        },
    },
    // mounted() {
    //     let self = this;
    // },
    // beforeDestroyed() {
    //     let self = this;
    // }
})


