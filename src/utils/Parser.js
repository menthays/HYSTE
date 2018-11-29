/**
 * Parser module by Hao Yang
 */

// @flow

/** string escaper to reg */
const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

const string2reg = (str: string): string => {
	return str.replace(matchOperatorsRe, '\\$&');
};

/** Class Parser */
export default class Parser {
  commonReg: RegExp
  props: Array<string>
  levelReg: RegExp
  levelAlias: Array<string>

  static DEFAULT_COMMON_REG = /\s*(INFO|WARN|ERROR)\s*([\d\s:\(\)|;]+)\s*(.*)/
  
  static DEFAULT_PROPS = ['level', 'others', 'content']

  static DEFAULT_LEVEL = ['none', 'debug', 'info', 'warn', 'error']

  static DEFAULT_LEVEL_REG = /^(INFO|WARN|ERROR)/

  constructor(commmonReg: string, props: Array<string>, levelReg: string, levelAlias: ?Array<string>) {
    if (commmonReg) {
      this.commonReg = new RegExp(string2reg(commmonReg));
    } else {
      this.commonReg = Parser.DEFAULT_COMMON_REG;
    }


    if (levelReg) {
      this.levelReg = new RegExp(string2reg(levelReg));
    } else {
      this.levelReg = Parser.DEFAULT_LEVEL_REG;
    }

    if(props && Array.isArray(props)) {
      if (!props.includes('level') || !props.includes('content')) {
        throw new Error(`props must contain 'level' and 'content'`)
      }
      this.props = props;
    } else {
      this.props = Parser.DEFAULT_PROPS
    }

    if (levelAlias && Array.isArray(levelAlias)) {
      if (this.levelAlias.length !== Parser.DEFAULT_LEVEL.length) {
        throw new Error(`levelAlias not compatible with ['none', 'debug', 'info', 'warn', 'error']`)
      }
      this.levelAlias = levelAlias
    } else {
      this.levelAlias = Parser.DEFAULT_LEVEL
    }
    
  }

  parse(str: string):Object {
    // get level
    let level = 'none'
    let levelRst = str.match(this.levelReg);
    if (levelRst) {
      let index = this.levelAlias.findIndex(item => item === (levelRst[0]).toLowerCase());
      if (index !== -1) {
        level = String(Parser.DEFAULT_LEVEL[index]);
      }
    }

    // get other props
    let rst = this.commonReg.exec(str);
    // if failed
    if (!rst) {
      // console.warn('[Parser] ', 'Result of Regexp execution incompatible is Null')
      return {
        level, content: str
      }
    }
    // if incompatible
    if (rst.length - 1 !== this.props.length) {
      // console.warn('[Parser] ', 'Result of Regexp execution incompatible with your Props')
      return {
        level, content: str
      }
    }

    // get result
    let result = {level: level}
    for(let i=0; i< this.props.length; i++) {
      if (this.props[i] !== 'level') {
        result[this.props[i]] = rst[i+1];
      }
    }
    return result;
  }

}