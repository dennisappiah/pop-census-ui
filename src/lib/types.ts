// type InterviewDates = {
//     startDate: string;
//     endDate: string;
//   };
  
// //  locationInfo 
// export type LocationInfo = {
//     regionName: string;
//     districtName: string;
//     localityName: string;
//     address: string;
//     phone1: string;
//     phone2: string;
//     enumAreaCode: { code: string };
//     nhisNumber: string;
//     eaType: string;
//     localityCode: string;
//     structureNumber: string;
//     householdNumber: string;
//     residenceType: string;
//     interviewDates: InterviewDates;
//     householdSummary: {
//         totalMembers: number;
//         maleCount: number;
//         femaleCount: number;
//     };
//   };


// export type HouseholdMember = {
//   personId: string;
//   fullName: string;
//   relationshipToHead: string;
//   relationshipCode: string;
//   sex: 'M' | 'F' | 'O';
//   status: 'A' | 'I';
// };

// // householdRoster
// export type HouseholdRoster = {
//     members: HouseholdMember[];
//   };


// export type AbsentMember = {
//     lineNo: string;
//     fullName: string;
//     relationshipToHead: string;
//     code: string;
//     sex: 'M' | 'F';
//     age: string;
//     destination: string;
//     regionCode: string;
//     monthsAbsent: string;
//   };
  
// export type Emigrant = {
//     lineNo: string;
//     fullName: string;
//     relationshipToHead: string;
//     code: string;
//     sex: 'M' | 'F';
//     age: string;
//     countryName: string;
//     countryCode: string;
//     yearOfDeparture: string;
//     activityCode: string;
//     otherActivity: string | null;
//   };

// //   temporaryAbsentees
// export type TemporaryAbsentees = {
//     absentCount: string;
//     hasEmigrants: YesNo;
//     absentMembers: AbsentMember[];
//     emigrants: Emigrant[];
// };
  
 

// export interface HouseholdUnit {
//   fullName: string;
//   dateOfBirth: {
//     day: string;
//     month: string;
//     year: string;
//   };
//   age: string;
//   nationality: string;
//   ethnicity: string;
// }

// // householdUnit
// export interface HouseholdUnitFormProps {
//     people: HouseholdUnit[];
  
// }

// // economicActivityData
// export interface EconomicActivity {
//   activityId: string;
//   establishmentName: string;
//   mainProduct: string;
//   industryCode: string;
//   employmentStatus: string;
//   employmentSector: string;
// }


// export interface economicActivityData{
//   activities: EconomicActivity[];
// }

// // fertilityData
// export interface FertilityData {
//   childrenEverBorn: {
//     male: number;
//     female: number;
//   };
//   childrenSurviving: {
//     male: number;
//     female: number;
//   };
//   childrenBornPast12Months: {
//     boy: number;
//     girl: number;
//   };
// }

// // disabilityData
// export type YesNo = 'YES' | 'NO';

// export type DisabilityData = {
//   sight: YesNo;
//   hearing: YesNo;
//   speech: YesNo;
//   physical: YesNo;
//   intellectual: YesNo;
//   emotional: YesNo;
//   other: YesNo;
// };

  
// // agriculturalActivity
// export type agriculturalActivity = {
//     cropFarming: 'YES' | 'NO';
//     treeGrowing: 'YES' | 'NO';
//     livestockRearing: 'YES' | 'NO';
//     fishFarming: 'YES' | 'NO';
//     membersCount: {
//       male: number;
//       female: number;
//     };
//     crops: Array<{
//       type: string;
//       cropCode: string;
//       farmSize: number;
//       measurementUnit: string;
//     }>;
//     livestock: Array<{
//       type: string;
//       code: string;
//       number: number;
//     }>;

// }
 