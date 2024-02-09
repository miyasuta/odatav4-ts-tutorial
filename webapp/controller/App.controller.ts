import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import Table from "sap/m/Table";
import ODataListBinding, { ODataListBinding$ChangeEvent } from "sap/ui/model/odata/v4/ODataListBinding";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Sorter from "sap/ui/model/Sorter";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Message from "sap/ui/core/message/Message";
import Input, { Input$LiveChangeEvent } from "sap/m/Input";
import Messaging from "sap/ui/core/Messaging";
import Context from "sap/ui/model/odata/v4/Context";
import { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
import Control from "sap/ui/core/Control";
import SplitterLayoutData from "sap/ui/layout/SplitterLayoutData";

interface ViewModel {
    busy: boolean;
    hasUIChanges: boolean;
    usernameEmpty: boolean;
    order: number;
}

//Interfaceのキーを固定値として持つオブジェクト
const ViewModelKey: {[K in keyof ViewModel]: K} = {
    busy: "busy",
    hasUIChanges: "hasUIChanges",
    usernameEmpty: "usernameEmpty",
    order: "order"
}

interface Person {
    UserName: string,
    FirstName: string,
    LastName: string,
    Age: string
}

enum ModelNames {
    appView = "appView",
    message = "message"
}

enum Controls {
    list = "peopleList",
    detail = "detailArea",
    layout = "defaultLayout",
    search = "searchField"
}

/**
 * @namespace sap.ui.core.tutorial.odatav4
 */
export default class App extends Controller {
    private _bTechnicalErrors: boolean;

    public onInit(): void {
        // const messageManager = sap.ui.getCore().getMessageManager(), //deprecated
        const  messageModel = Messaging.getMessageModel(),//messageManager.getMessageModel(),
                messageModelBinding = messageModel.bindList("/", undefined, [],
                new Filter("technical", FilterOperator.EQ, true)),
                viewModel: ViewModel = {
                    busy: false,
                    hasUIChanges: false,
                    usernameEmpty: false,
                    order: 0
                }
        this.getView()?.setModel(new JSONModel(viewModel), ModelNames.appView);
        this.getView()?.setModel(messageModel, ModelNames.message);

        messageModelBinding.attachChange(this.onMessageBindingChange, this);
        this._bTechnicalErrors = false;
                
        // const oJSONData: ViewModel = {
        //         busy : false,
        //         order: 0
        //     },
        // oModel = new JSONModel(oJSONData);

        // this.getView()?.setModel(oModel, "appView");
    }

    public onCreate(): void {
        const list = this.byId(Controls.list) as Table,
              binding = list?.getBinding("items") as ODataListBinding,
              person: Person = {
                UserName: "",
                FirstName: "",
                LastName: "",
                Age: "18"
              },
              context = binding.create(person);

        this._setUIChanges();
        const viewModel = this.getView()?.getModel(ModelNames.appView) as JSONModel;
        viewModel.setProperty(`/${ViewModelKey.usernameEmpty}`, true);

        list.getItems().some(item => {
            if (item.getBindingContext() === context) {
                item.focus();
                item.setSelected(true);
                return true;
            }
        })
    }

    public onDelete(): void {
        const selected = (this.byId(Controls.list) as Table).getSelectedItem();
        const peopleList = this.byId(Controls.list) as Table;
        
        if (selected) {
            const context = selected.getBindingContext() as Context;
            const userName = context?.getProperty("UserName");
            context.delete().then(()=> {
                MessageToast.show(this._getText("deletionSuccessMessage", userName));
            }).catch((error: {message: string, canceled: boolean}) => {
                if (context === peopleList.getSelectedItem().getBindingContext()) {
                    this._setDetailArea(context);
                }
                this._setUIChanges();
                if (error.canceled) {
                    MessageToast.show(this._getText("deletionRestoredMessage", userName));
                    return;
                }
                MessageBox.error(error.message + ": " + userName);
            })
            this._setDetailArea();
            this._setUIChanges(true);
            
        }
    }

    public onSelectionChange(event: ListBase$SelectionChangeEvent): void {
        this._setDetailArea(event.getParameter("listItem")?.getBindingContext() as Context);
    }

    private _setDetailArea(userContext?: Context): void {
        const detailArea = this.byId(Controls.detail) as Control,
              layout = this.byId(Controls.layout) as SplitterLayoutData,
              searchField = this.byId(Controls.search) as Input;

        if (!detailArea) {
            return; // do nothing when running within view destruction
        }

        const oldContext = detailArea.getBindingContext() as Context;
        if (oldContext) {
            oldContext.setKeepAlive(false);
        }

        if (userContext) {
            userContext.setKeepAlive(true, this._setDetailArea.bind(this));
            detailArea?.setBindingContext(userContext);
        }   
        detailArea.setVisible(!!userContext);
        layout.setSize(userContext ? "60%" : "100%");
        layout.setResizable(!!userContext);
        searchField.setWidth(userContext ? "40%" : "20%");        
    }

    public onInputChange(event: Input$LiveChangeEvent): void {
        if (event.getParameter("escPressed")) {
            this._setUIChanges();
        } else {
            this._setUIChanges(true);
            if (event.getSource().getParent()?.getBindingContext()?.getProperty("UserName")) {
                var model = this.getView()?.getModel(ModelNames.appView) as JSONModel;
                model.setProperty(`/${ViewModelKey.usernameEmpty}`, false);
                // model.setProperty("/usernameEmpty", false);
            }
        }
    }
    
    public onRefresh(): void {
        const binding = this.byId("peopleList")?.getBinding("items") as ODataListBinding;
        if(binding.hasPendingChanges()) {
            MessageBox.error(this._getText("refreshNotPossibleMessage"));
            return;
        }
        binding.refresh();
        MessageToast.show(this._getText("refreshSuccessMessage"));        
    }

    public onResetChanges(): void {
        (this.byId("peopleList")?.getBinding("items") as ODataListBinding).resetChanges();
        this._bTechnicalErrors = false;
        this._setUIChanges();
    }

    public onResetDataSource(): void {
        const model = this.getView()?.getModel() as ODataModel,
                operation = model.bindContext("/ResetDataSource(...)");

        operation.execute().then(() => {
            model.refresh();
            MessageToast.show(this._getText("sourceResetSuccessMessage"));
        }).catch((error: {message: string}) => {
            MessageBox.error(error.message);
        }) 
    }

    public onSave(): void {
        const fnSuccess = () => {
            this._setBusy(false);
            MessageToast.show(this._getText("changesSentMessage"));
            this._setUIChanges(false);
        }

        const funError = (erorr: {message: string}) => {
            this._setBusy(false);
            this._setUIChanges(false);
            MessageBox.error(erorr.message);
        }

        this._setBusy(true);
        (this.getView()?.getModel() as ODataModel).submitBatch("peopleGroup")
        .then(fnSuccess, funError);
        this._bTechnicalErrors = false;
    }

    public onSort(): void {
        const view = this.getView(),
              statuses = [undefined, "asc", "desc"],
              statusTextIds = ["sortNone", "sortAscending", "sortDescending"];
        let message = "",
            iOrder = view?.getModel("appView")?.getProperty(`/${ViewModelKey.order}`);

        iOrder = (iOrder + 1) % statuses.length;
        const sOrder = statuses[iOrder];

        (view?.getModel("appView") as JSONModel).setProperty(`/${ViewModelKey.order}`, iOrder);
        (view?.byId("peopleList")?.getBinding("items") as ODataListBinding).sort(new Sorter("LastName", sOrder === "desc"));
        message = this._getText("sortMessage", [this._getText(statusTextIds[iOrder])]);
        MessageToast.show(message);
    }

    public onMessageBindingChange(event: ODataListBinding$ChangeEvent): void {
        const contexts = event.getSource().getContexts();
        let messages: Message[];
        let messageIsOpen = false;

        if (messageIsOpen || !contexts.length) {
            return;
        }

        //extract and remove the technical messages
        messages = contexts.map(context => {
            return context.getObject();
        });
        // sap.ui.getCore().getMessageManager().removeMessages(messages);
        Messaging.removeMessages(messages);

        this._setUIChanges(true);
        this._bTechnicalErrors = true;
        MessageBox.error(messages[0].getMessage(), {
            id: "serviceErrorMesageBox",
            onClose: () => {
                messageIsOpen = false;
            }
        });
        messageIsOpen  = true;


    }

    private _getText(textId: string, args?: string[]): string {
        const resurceBundle = (this.getOwnerComponent()?.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
        return resurceBundle.getText(textId, args) as string;       
    }

    private _setUIChanges(hasUIChanges?: boolean) : void {
        if (this._bTechnicalErrors) {
            hasUIChanges = true;
        } else if (hasUIChanges === undefined) {
            hasUIChanges = (this.getView()?.getModel() as ODataModel).hasPendingChanges();
        }
        
        // リフレッシュまでしないと、同じ結果にならない
        // const model = this.getView()?.getModel("appView") as JSONModel;
        // const data = model.getData() as ViewModel;
        // data.hasUIChanges = hasUIChanges;
        // model.refresh();

        var model = this.getView()?.getModel(ModelNames.appView) as JSONModel;
			model.setProperty(`/${ViewModelKey.hasUIChanges}`, hasUIChanges);
    }

    private _setBusy(isBusy: boolean): void {
        const viewModel = this.getView()?.getModel("appView") as JSONModel;
        viewModel.setProperty(`/${ViewModelKey.busy}`, isBusy);
    }     
    
} 
