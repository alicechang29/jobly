Code Review Q's:
- _testCommon is setting up the test DB with what is needed before each test is run and cleaning up the
DB after each test finishes
    - don't have to write this by hand for each test bc it is the same setup for all tests

-


- Test token
```json
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsaWNlY2hhbmciLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNzE2Mzk5OTUyfQ.Sz6duWJwZ39CazoTCswPeV6pDR8OBtdvWEKnJm2LtKI"
}
```

# MODELS

## company -- handle = primary key
- create
- find all
- get (by company handle)
- update (by company handle)
- remove (by company handle)

## user
- authenticate
- register
- find all
- get (by username)
- update (by username)
- remove (by username)


# DB Relationship

1 company : Many jobs
    1 company : Many applications


1 job : Many applications
1 user : Many applications



```javascript
const keys = Object.keys(dataToUpdate);

const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
```

for each key within the the array of Object Keys (called colName),
take the colName (key) and index

jsToSql is an existing object of.... ??

set jsToSql[colName] OR colName equal to $index+1

so cols is: []