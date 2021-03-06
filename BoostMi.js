// Our app obj, will be a Vue Obj once we finished loading the page.
var app = {};
var baseUrl = "http://localhost:3000/";
var emptyCust = {
    id: null,
    picture: "",
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phoneNumber: "",
    billingAddress: {
        street: "",
        city: "",
        province: "",
        country: "",
    },
    notes: "",
};
var emptyRequest = {
    date: null,
    customer_id: null,
    type: "PROFESSIONAL_BOOST",
    location: {
        street: '',
        city: '',
        province: '',
        country: '',
    }
}

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
            },
            requestsForCustomer: {

            },
            currentRequest: null,
            serviceTypes: {
                'PROFESSIONAL_BOOST': "Boost by a professional",
                'CAR_UNLOCKING': "Unlocking of car",
                'TOW': "Towing",
                'GAS_DELIVERY': "Gas delivery",
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
            },
            viewCustomer(cust_id) {
                this.state = "view";
                this.currentCust = Object.assign({}, this.customers[cust_id]);
                // Fetch requests for this customer
                $.ajax({
                    url: baseUrl + 'requests',
                    data: {
                        customer_id: cust_id, 
                    },
                    type: 'GET',
                    dataType: 'json',
                    success: function(response) {
                        app.requestsForCustomer = response;
                    }
                })
            },
            createCustomer() {
                this.state = "create";
                this.currentCust = Object.assign({}, emptyCust);
            },
            submitCust() {
                // Create scenario
                if (!this.currentCust.id) {
                    $.ajax({
                        type: "POST",
                        url: baseUrl + 'customers',
                        data: JSON.stringify(this.currentCust),
                        contentType: "application/json",
                        dataType: 'json',
                        success: function(response) {
                            app.customers[app.currentCust.id] = response;
                            app.state = "view";
                        }
                    })
                // Update scenario
                } else {
                    $.ajax({
                        type: "PUT",
                        url: baseUrl + 'customers/'+this.currentCust.id,
                        data: JSON.stringify(this.currentCust),
                        contentType: "application/json",
                        dataType: 'json',
                        success: function(response) {
                            app.customers[app.currentCust.id] = response;
                            app.state = "view";
                        }
                    })
                    
                }
            },
            submitReq() {
                $.ajax({
                    type: "POST",
                    url: baseUrl + 'requests',
                    data: JSON.stringify(this.currentRequest),
                    contentType: "application/json",
                    dataType: 'json',
                    success: function(response) {
                        // Next key
                        key = Object.keys(app.requestsForCustomer).length;
                        app.requestsForCustomer[key] = response;
                        app.state = "view";
                    }
                })
            },
            createRequest() {
                this.state = "createReq";
                this.currentRequest = Object.assign({}, emptyRequest);
                this.currentRequest.customer_id = this.currentCust.id;
            },
            viewRequest(request_key) {
                this.state = "viewReq";
                this.currentRequest = Object.assign({}, this.requestsForCustomer[request_key]);
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
                        // Very simple string matching search (just to show that searching works)
                        // Could be modified to use better search/matching
                        if (typeof customer[field] == 'string') {
                            if (searchTerm.trim() != '' && !customer[field].toLowerCase().includes(searchTerm.trim().toLowerCase())) {
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
            },
            stateSwitch: function() {
                if (this.state == "view") {
                    return "update";
                } else if (this.state == "update") {
                    return "view";
                }
                return "";
            }
        },
    });

    // Fetch customers on page load
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
