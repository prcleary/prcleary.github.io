---
title: Laboratory implementation and IDSR
date: 2022-10-25
tags:
  - LIMS
  - Global health informatics
---

### How Does a Public Health Laboratory Interface with IDSR?

The public health laboratory has an essential role in integrated disease surveillance and response. Laboratory professionals are key collaborators in provision of advice, early detection of public health threats, investigation of outbreaks and incidents and providing data for communicable disease surveillance. Laboratory data provides important information for communicable disease control and is essential for accurate identification of some infections, such as those which present with common disease syndromes (e.g. gastrointestinal or viral illnesses) or asymptomatically.

The public health laboratory may directly detect cases or outbreaks of diseases of public health concern. Planning, training and clear documented operational procedures are required to ensure prompt communications between public health laboratories and other parts of an integrated disease surveillance and response system.

Public health laboratory professionals have an essential role in field investigations of outbreaks and incidents and should be involved at the earliest opportunity. They determine the appropriate specimens and tests required and provide important advice to public health colleagues on specimen collection, handling and transport to the laboratory. They coordinate rapid turnaround of testing at the laboratory and sharing of results.

Public health laboratories provide primary diagnostic capability which may be essential for defining cases of disease. They may also provide additional laboratory methods such as serology or subtyping which are of value to communicable disease control. Routine communicable disease surveillance usually requires transfer of data from the laboratory to public health authorities.

Laboratories typically use a computerised system for data management (a laboratory information management system, or LIMS; there are many types), whereas typically public health authorities use a separate information management system. Routine transfer of data from a laboratory information management system to another information system can be achieved in a number of ways, each of which has advantages and disadvantages. All approaches require careful data quality assurance and protection of information security.

Data may be directly entered into the public health information management system at the laboratory. One advantage of this is simplicity of implementation; disadvantages including staffing requirements and risk of data entry errors.

Data may be extracted periodically (usually daily or more frequently) from the laboratory information management system, for processing and import into the public health information management system. The data extract may be simple (aggregated data) or more complex (case-based data) and the process may be manual or automated. Data imported to the public health information may be stored separately or linked to other data in that system. Data transfer requires appropriate hardware and network connectivity, and trained staff to maintain them, for both systems.

Automated transfer of data between systems is only feasible when both systems are interoperable, which means both systems must be able to connect to other information systems using common data standards and protocols. An interoperable information system would commonly have a computing interface called an API (Application Programming Interface) which allows other systems to interact with it over a network. For example, DHIS 2 has an API allowing data to be imported or exported.

Use of APIs to transfer data requires either maintenance of close alignment between the data in the laboratory system and the data in the public health information management system or the development and maintenance of an intermediate processing step to convert data from one form to another. Incompatibilities or errors in data may prevent data transfer. Maintaining alignment between data systems requires careful planning and the availability of sufficient skilled staff to maintain the process. Transfer of a simpler data set, such as aggregated data, may be simpler to maintain.

If one or both systems do not have an API, then a completely automated process for data transfer may not be feasible. Data may need to be manually exported from one system or imported to the other, possibly with an intermediate processing step. This may have greater staffing requirements than a fully automated process.

Once data is imported into the public health information management system, it is possible to integrate that data with other data sets only if it is possible to match records using unique identifiers for persons and/or specimens. For data aggregated to health facility level, this requires a common master list of health facilities (or their codes) between the two systems. For case-based data, this requires at minimum a unique identifier for every person in the country or a unique specimen identifier which is captured by both systems. Where such linking identifiers are not available it will not be straightforward to automate linkage of laboratory data with other data in the public health information management system and the data sets may need to be stored separately.

Where rapid implementation is required and resources are limited, the most straightforward approach is for the laboratory to directly enter aggregated numbers of laboratory-confirmed cases into the public health information management system. If APIs are available for both systems, transfer of aggregated data can be automated. If transfer of case-based information is required via APIs between two systems which are not aligned, then an intermediate data processing step can be set up on the server of the public health information system to extract data from the laboratory system, transform it into the appropriate format and import it to the public health system. Linkage to other data sets will be possible if unique person identifiers are available, or if unique specimen identifiers are recorded in both systems.

### Minimum dataset for surveillance

Laboratories are usually only required to provide a minimum data set for public health purposes. Data may be aggregated, in which only dates, locations and counts are provided for laboratory-confirmed cases. For case-based data the key data items required relate to time, place and person, as well as of course the laboratory results.

Time: the date of collection should be recorded. If this is not available, the date of receipt at the laboratory may be used.

Place: both the health facility where the test was taken and the location of the case (residential address) should be recorded.

Person: the most important data item for a case is a unique identifier such as a national identity card number. Without this it may not be possible to link laboratory data to other data. In addition, name, date of birth, gender and contact details are usually required.

Laboratory results: these will differ according to the test used, but should including type of specimen, the test/s undertaken and the results of the tests.

Specific laboratory request forms for certain diseases can allow collection of additional information for public health purposes. This could include clinical details or risk factor information such as travel history or occupation.

