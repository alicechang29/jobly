Code Review Q's:
- _testCommon is setting up the test DB with what is needed before each test is run and cleaning up the
DB after each test finishes
    - don't have to write this by hand for each test bc it is the same setup for all tests

-

1. write test for Where helper fn - DONE
2. write Where helper fn - DONE
3. write test for model fn
4. fix model fn - DONE
5. fix json schema - DONE
6. update company test - DONE
7. fix company routes - DONE




# Testing - TODO:
- beware of falsy values (company with no employees)
- where clause helper fn
- model - filter test
- fix json schema validator - remove the null bc now can check via the where fn

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



for each key within the the array of Object Keys (called colName),
take the colName (key) and index

jsToSql is an existing object of.... ??

set jsToSql[colName] OR colName equal to $index+1

so cols is: []


## Filtering Function
- minEmployees
    - companies that meet min Employee criteria
    - what about companies that don't set this value?
- maxEmployees

- if minEmployees > maxEmployees, return 400 error

On Route:
if query params are empty, get All companies
else...
    do filtering
On Model:
- add a new query to company model



 (name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3)
          OR(num_employees >= $2 AND num_employees <= $3)
          OR(num_employees >=$2)
          OR(num_employees <=$3)
          OR (name ILIKE $1)