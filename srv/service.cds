using {Mydb as db} from '../db/schema';

service MyService {
    entity Std as projection on db.Std;

    action getAccessToken()                               returns String;

    action getCostData()                                  returns String;

    action getUsageData(fromDate: String, toDate: String) returns String;

    action fetchUsage(fromDate: String,
                      toDate: String) returns String;

  
    action fetchCost(fromDate: String,
                     toDate: String)  returns String;

}

