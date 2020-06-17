

var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        "file_meta_list": [],
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
            self.makeContent();
        },
        makeContent: function() {
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


