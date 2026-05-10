<template>
    <div class="edit-tables">
        <form class="edit-table" id="informations-form" @submit.prevent="saveTable()">
            <div class="form-group">
                <label for="id">Número da mesa</label>
                <input type="number" name="id" id="id" v-model="table.id" required>
            </div>
            <div class="form-group">
                <label for="descricao">Categoria</label>
                <input type="text" name="descricao" id="descricao" v-model="table.descricao">
            </div>
            <div class="form-group">
                <label for="">QR Code</label>
                <div class="qr-code-container">
                    <qrcode
                        id="qr-code"
                        :text="table.qrcode"
                        :size="152"
                        :class="tableid == null ? 'blur-image' : ''"
                    />
                    <button v-if="tableid != null" type="button" class="btn btn-primary" v-on:click="printOutTableQRCode()">Imprimir</button>
                    <h3 v-else>Faça a inclusão da mesa para ver o QR Code</h3>
                </div>
            </div>
            <p class="response">{{ response }}</p>
            <input type="submit" id="submit-button" style="display: none;">
        </form>
    </div>
</template>
<script>
import Qrcode from 'vue-qrcode-component';
import $ from 'jquery';
import api from "../../configs/api";
import { globalMethods } from "@/js/globalMethods";

export default {
    name: "editTablesModalContent",
    mixins: [globalMethods],
    props: ["tableid"],
    data() {
        return {
            table: {
                id: null,
                descricao: "",
                qrcode: "https://rabsystems.com.br?utm_source=gourmetech_table_qr_code"
            },
            savingTable: false
        }
    },
    methods: {
        printOutTableQRCode: function () {
            let qrCodeBase64 = $("#qr-code img").attr("src");
            this.$router.push("/home/printout?image=" + encodeURIComponent(qrCodeBase64));
        },
        saveTable: function () {
            let self = this;

            if (self.savingTable) return;

            self.savingTable = true;
            
            let data = $("#informations-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["old_id"] = self.tableid;

            let path = "create_table";

            if (self.tableid != null) {
                path = "edit_table";
            }

            api.post("/tables/" + path, data).then(() => {
                self.$emit("savedContent", true);
            }).catch((error) => {
                self.setResponse(error.response.data, "error");
            }).then(() => {
                self.savingTable = false;
            })
        },
        returnTable: function () {
            let self = this;
            
            if (self.tableid == 0 || self.tableid == null) return;

            api.get("/tables/" + self.tableid).then((response) => {
                self.table = response.data.returnObj;
            }).catch((error) => {
                console.log(error);
            })
        },
    },
    mounted: function () {
        this.returnTable();
    },
    components: {
        Qrcode
    }
}
</script>
<style scoped>
.qr-code-container {
    display: flex;
    align-items: center;
}

#qr-code {
    margin-right: var(--space-6);
    padding: var(--space-4);
    border: 3px dashed var(--blue);
    border-radius: var(--radius-md);
}

@media (max-width: 425px) {
    .qr-code-container {
        flex-direction: column;
        margin: var(--space-6) 0;
    }

    #qr-code {
        margin-right: 0;
        margin-bottom: var(--space-6);
    }
}
</style>