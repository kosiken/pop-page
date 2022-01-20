import camelCase from 'lodash/camelCase';
import startCase from 'lodash/startCase';
import snakeCase from 'lodash/snakeCase'




export function reduceString(text: string, length = 10): string {
    return text.length > length ? text.substring(0, length - 3) + '...' : text
}

export function titleCase(text: string): string {
    return startCase(camelCase(text))
}


export function removeFromIndex<T>(array:T[], index: number): T[] {
    if(index < 0 ||  index >= array.length ) {
        return array;
    }

    let o = [...array];
    return o.splice(index, 1)
}

export function getTableName(table: string)  {
    return "app-" + snakeCase(table).toLowerCase();
}


export function getDate(date:number) {
     const d = new Date(date)
     return  d.toUTCString()

}