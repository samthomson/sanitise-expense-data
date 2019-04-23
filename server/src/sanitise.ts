import * as path from 'path'
import * as fs from 'fs'
import * as csv from 'csv-parser'
import * as moment from 'moment'
import { Parser as Json2csvParser } from 'json2csv'
import { Expense, Mapping } from './../src/declarations'

const main  = async () => {
	// @ts-ignore
	console.log('\nsanitisationscript\n')

	// get path of file to import
	const sImportDir: string =  path.resolve(path.dirname(__filename), 'data')
	const sImportFileName: string = `san.csv`
	const sImportPath: string = path.resolve(sImportDir, sImportFileName)
	console.log(`importing from ${sImportPath}`)


	const aExpenses: Expense[] = await readInFile(sImportPath)
	const aUpdateMappings: Mapping[] = await readInFile(path.resolve(sImportDir, 'map.csv'))
	
	console.log(`${aExpenses.length} expenses read from csv`)

	const unique = [...new Set(aExpenses.map(item => item.Vendor))]
	console.log(`${unique.length} unique expenses`)
	console.log(`${aUpdateMappings.length} mappings`)

	if (unique.length !== aUpdateMappings.length) {
		console.log(`\n\nMissing mappings for ${(unique.length - aUpdateMappings.length)} expenses\n\n`)
	}

	let cFoundMapping = 0
	// go through every expense
	aExpenses.map((oExpense) => {
		let { Vendor } = oExpense
		let aMatchingFilter: Mapping[] = aUpdateMappings.filter((oMapping) => oMapping.Vendor === Vendor)
		if (aMatchingFilter.length > 0) {
			const { Category, Subcategory } = aMatchingFilter[0]
			cFoundMapping++
			// console.log('\nVendor: ', Vendor)
			// console.log('Update to category: ', Category)
			// console.log('Update to subcategory: ', Subcategory)

			oExpense.Category = Category
			oExpense.Subcategory = Subcategory
		} else {
			console.log(`no mapping found for ${Vendor}`)
		}
		// oExpense.Vendor
	})
	console.log('cFoundMapping: ', cFoundMapping)

	
	let fields = ['Date', 'Type', 'Category', 'Subcategory', 'Vendor', 'Payment', 'Currency', 'Amount', 'Note', 'ID']

	const json2csvParser = new Json2csvParser({ fields });
	const result = json2csvParser.parse(aExpenses);

	// console.log(unique)

	// console.log(result)
	fs.writeFile('src/data/out.csv', [result], "utf8", function (err) {
		if (err) {
			console.log('Some error occured - file either not saved or corrupted file saved.');
		} else{
			console.log('It\'s saved!');
		}
	})
}

main()

async function readInFile (sImportFile: string) {
	return new Promise<Expense[]>(resolve => {

		let results: Expense[] = []

		fs.createReadStream(sImportFile)
			.pipe(csv())
			.on('data', (data: any) => {
				return results.push({
					...data
				})
			})
			.on('end', () => {
				resolve(results)
			})
	})
}
