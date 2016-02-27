import React from 'react';
import { addHighlight } from 'actions/actions';
import { connect } from 'react-redux';

const mapDispatchToProps = dispatch => {
  return {
    onHighlight: (start, end, selectedText) => {
      dispatch(addHighlight(start, end, selectedText));
    }
  };
}

const mapStateToProps = state => {
  // is this hierarchy correct?
  return { highlights: state.articleReducers.highlights };
}

const Article = React.createClass({
  displayName: 'Article',

  contextTypes: {
    params: React.PropTypes.object.isRequired
  },

  propTypes: {
    article: React.PropTypes.object.isRequired,
    topics: React.PropTypes.array.isRequired,
    onHighlight: React.PropTypes.function,
    highlights: React.PropTypes.array
  },

  handleClick: function() {
    var selectionObj = window.getSelection();
    if (selectionObj) {
      // does this kind of data munging belong in a reducer?
      let selectedText = selectionObj.toString();
      let start = selectionObj.anchorOffset;
      if (this.articleRef.childNodes.length > 1) {
        // since we're splitting <Article> into <span>s we'll need to find which <span>
        // anchorOffset is referring to, and find that offset from the start of <Article>
        for (var i in this.articleRef.childNodes) {
          var childNode = this.articleRef.childNodes[i];
          if (childNode === selectionObj.anchorNode.parentNode) {
            break;
          } else {
            // console.dir(childNode);
            // console.dir(selectionObj.anchorNode);
            start += childNode.textContent.length;
          }
        }
      }
      console.log(this.articleRef.childNodes.length, selectionObj);
      // let start = this.articleRef.textContent.indexOf(selectedText);
      let end = start + selectedText.length;
      if (!(start === end && start === 0)) {
        console.log(this);
        this.props.onHighlight(start, end, selectedText);
      }
    }
  },

  render() {
    const {topic_id}: string = this.context.params
    let article = this.props.article;
    let topic = this.props.topics[topic_id];

    var text = this.props.article.text;
    var highlights = this.props.highlights || [];

    var start = 0;
    var tail = '';
    var l = highlights.length;

    if (l === 0) {
      tail = text;
    } else if (highlights[l - 1].end !== text.length) {
      tail = <span>{text.substring(highlights[l - 1].end, text.length)}</span>;
    }

    return (
      <div>
        <div className='tua__header-text'>
          Focus on the bold text about '{topic.name}' and answer the questions.
        </div>
        <div ref={(ref) => this.articleRef = ref} className='article' onClick={this.handleClick}>
          {Array(highlights.length * 2).fill().map((_,i) => {
            var curHL = highlights[i / 2 | 0];
            if (i % 2 === 0) {
              // render normal text
              return (<span>{text.substring(start, curHL.start)}</span>);
            } else {
              // render highlight
              start = curHL.end;
              return (<span className='highlighted'>{text.substring(curHL.start, curHL.end)}</span>);
            }
          })}
          { tail }
        </div>
      </div>
    );
  }

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Article);