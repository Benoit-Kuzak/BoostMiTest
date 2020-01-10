// Our app obj, will be a Vue Obj once we finished loading the page.
var app = {};
var baseUrl = "http://localhost:3000/";

$(document).ready(function() {
    app = new Vue({
        el: '#app',
        // You need to instantiate all the variables for the initial render
        data: {
            customers: {},
            currentCust: null,
            state: 'listing',
            sortVar: 'id',
            sortAsc: true,
            searchFields: {
                firstName: '',
                email: '',
                company: '',
                lastName: '',
                id: '',
            }
        },
        methods: {
            // Sets the sort variables
            sort: function(new_sort) {
                if (new_sort === this.sortVar) {
                    this.sortAsc = !this.sortAsc;
                } else {
                    this.sortAsc = true;
                    this.sortVar = new_sort;
                }
            }
        },
        // Obj used for table, based off basic list of customers
        // Then filtered with search and sorted
        computed: {
            filteredCustomers: function() {
                // Shallow copy of customers should do
                // transformed to array
                customerObjCopy = Object.assign({}, this.customers);
                customerCopy = Object.values(customerObjCopy);

                searchFields = this.searchFields;
                // Filter using array filter function
                filtered = customerCopy.filter(customer => {
                    for([field,searchTerm] of Object.entries(searchFields)) {
                        // If search term is not empty and is found in string
                        if (typeof customer[field] == 'string') {
                            if (searchTerm.trim() != '' && !customer[field].toLowerCase().includes(searchTerm.toLowerCase())) {
                                return false;
                            }
                        } else {
                            if (searchTerm && searchTerm != customer[field]) {
                                return false;
                            }
                        }
                        
                    }
                    return true;
                });
                return filtered.sort((a,b) => {
                    modifier = this.sortAsc ? 1 : -1;
                    if (a[this.sortVar] < b[this.sortVar]) {
                        return -1 * modifier;
                    } else {
                        return 1 * modifier;
                    }
                })
            }
        }
    });
    $.ajax({
        url: baseUrl + 'customers',
        type: 'GET',
        data: {

        },
        dataType: 'json',
        success: function(response) {
            app.customers = response;
        },
    })

    

});
