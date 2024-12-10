import { LightningElement ,api,wire,track} from 'lwc';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getStockDetails from '@salesforce/apex/stockpriceFetch.getStockDetails';

const columns = [
      { label: "Stock", fieldName: "symbol", hideDefaultActions: true,sortable: true,
        cellAttributes: {
            style: 'font-weight: bold;' // Apply bold style
        },
      },
      { label: "Price", fieldName: "price", hideDefaultActions: true,cellAttributes: {
        style: 'font-weight: bold;' // Apply bold style
},
},
      { label: "% change", fieldName: "changesPercentage",sortable: true,hideDefaultActions: true,cellAttributes: {
          class: {
              fieldName: 'format'
          },
          alignment: 'left',
          style: 'font-weight: bold;' // Apply bold style
      }
},
    { label: "Market Cap", fieldName: "marketCap", sortable: true,hideDefaultActions: true,cellAttributes: {
        style: 'font-weight: bold;' // Apply bold style
}, },
    {
      label: "earningsAnnouncement",
      fieldName: "earningsAnnouncement",sortable: true,cellAttributes: {
        style: 'font-weight: bold;' // Apply bold style
},
      hideDefaultActions: true
    },
    { label: "PE", fieldName: "pe",sortable: true,cellAttributes: {
        style: 'font-weight: bold;' // Apply bold style
}, }
    //   { label: "General Ledger",fieldName: "promgt__GeneralLedger__c", hideDefaultActions: true,editable: true  },
  ];
export default class FetchStocksLWC extends LightningElement {
    columns = columns;    
    @track ListofObj = [];
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    async handleConfirmClick() {
        const result = await LightningConfirm.open({
            message: 'do you want to refresh the stock prices?',
            theme: "info",
            label: 'Please Confirm',
        });
        //Confirm has been closed
        //result is true if OK was clicked
        if(result){
            getStockDetails({
            })
                .then((res) => {
                    if (res != null && typeof res !== 'undefined') {
                    const dataList = JSON.parse(JSON.stringify(res));
    
                    for (let i = 0; i < res.length; i++) {
                        res[i].changesPercentage = res[i].changesPercentage.toFixed(2);
                        res[i].format =
                          res[i].changesPercentage < 0
                            ? "slds-text-color_error"
                            : "slds-text-color_success";
                        res[i].earningsAnnouncement = res[i].earningsAnnouncement.split(
                          "T"
                        )[0];
                    }
        this.ListofObj = res;
                        
                            
                            const evt = new ShowToastEvent({
                                title: 'Success',
                                message: 'Stock prices updated successfully!!',
                                variant: "success"
                              });
                              this.dispatchEvent(evt);
                          
                        
    
                    }
                })
                .catch(error => {
                    this.showErrorToast(error, this);
                });
    
        }
        //and false if cancel was clicked
    }
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.ListofObj];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.ListofObj = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }


}