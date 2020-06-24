

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
        onImport: function() {
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
            self.makeDB();
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
                    while (stmt.step()) {self.current_db_chats.push(stmt.getAsObject());};
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


