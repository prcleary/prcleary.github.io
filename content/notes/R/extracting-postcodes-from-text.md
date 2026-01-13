+++
title = "Extracting postcodes from text"
+++

```r
# https://www.randomlists.com/uk-addresses?qty=20

library(data.table)

addresses <- c('72 High Street CANTERBURY CT96 7CD',
'794 Church Road BLACKPOOL FY957BR',
'22 Grove Road SOUTHALL UB9 0FN',
'9431 Mill Lane EAST CENTRAL LONDON EC6 1OK',
'201 Manchester Road PAISLEY PA37 8OA',
'84 Church Street STEVENAGE sg83 3ri',
'6 Alexander Road SLOUGH SL973KM',
'8085 Victoria Street BELFAST BT71 3UJ',
'9265 The Green BOURNEMOUTH BH68 7WI',
'9651 North Street BATHBA55 0KD',
'345 Kingsway SOUTH EAST LONDON SE63 2JY',
'82 Kings Road OUTER HEBRIDES HS9 9OJ',
'13 West Street HEREFORD HR598YR',
'717 New Road WATFORD WD70 3XW',
'31 Broadway SWANSEA SA90 5YM',
'480 Station Road STOCKPORT sk758tq LA7 7DZ',
'467 Springfield Road WESTERN CENTRAL LONDON WC91 9BI',
'3 Queens Road CHELMSFORD CM0 0QE',
'7 Windsor Road SOUTH WEST LONDON SW11 3UY',
'475 Green Lane GLASGOW G33 3WC')

pattern <- '([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\\s?[0-9][A-Za-z]{2})'  
# http://webarchive.nationalarchives.gov.uk/+/http://www.cabinetoffice.gov.uk/media/291370/bs7666-v2-0-xsd-PostCodeType.htm

mydata <- data.table(addresses)

mydata[, postcodes1 := list(regmatches(addresses, gregexpr(pattern, addresses))), 1:nrow(mydata)]  # allow for more than one match

mydata[, postcodes2 := regmatches(addresses, regexpr(pattern, addresses)), 1:nrow(mydata)]  # only 1st match

mydata
```

