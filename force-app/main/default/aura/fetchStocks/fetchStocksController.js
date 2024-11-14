({
  initJSONData: function(component, event, helper) {
    const COLUMNS = [
      //       { label: "Status", fieldName: "promgt__Status__c", hideDefaultActions: true,},
        { label: "Stock", fieldName: "symbol", hideDefaultActions: true },
        { label: "Price", fieldName: "price", hideDefaultActions: true },
        { label: "% change", fieldName: "changesPercentage", hideDefaultActions: true,cellAttributes: {
            class: {
                fieldName: 'format'
            },
            alignment: 'left'
        }
 },
      { label: "Market Cap", fieldName: "marketCap", hideDefaultActions: true },
      {
        label: "earningsAnnouncement",
        fieldName: "earningsAnnouncement",
        hideDefaultActions: true
      },
      { label: "PE", fieldName: "pe" }
      //   { label: "General Ledger",fieldName: "promgt__GeneralLedger__c", hideDefaultActions: true,editable: true  },
    ];
    component.set("v.Manual", COLUMNS);
  },
  refresh: function(component, event, helper) {
   helper.refresh(component, event, helper);
  }
});