#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
    CouldNotRetrieveTranscript
)

def get_transcript(video_id, languages=['en']):
    """
    获取 YouTube 视频字幕
    使用 youtube-transcript-api 库，支持手动字幕和自动生成的字幕
    """
    try:
        api = YouTubeTranscriptApi()
        transcript = None
        used_language = None
        
        # 尝试获取指定语言的字幕（按优先级顺序）
        for lang in languages:
            try:
                transcript = api.fetch(video_id, languages=(lang,))
                used_language = transcript.language_code
                break
            except (NoTranscriptFound, TranscriptsDisabled, CouldNotRetrieveTranscript):
                # 这个语言不可用，继续尝试下一个
                continue
            except Exception as e:
                sys.stderr.write(f"尝试语言 {lang} 时出错: {str(e)}\n")
                continue
        
        # 如果指定语言都失败，尝试使用 list() 方法获取任何可用的字幕
        if not transcript:
            try:
                transcript_list = api.list(video_id)
                
                # 尝试找到可用的字幕（包括自动生成的）
                for available_transcript in transcript_list:
                    try:
                        # 优先尝试可翻译的字幕，翻译到首选语言
                        if available_transcript.is_translatable:
                            for lang in languages:
                                try:
                                    translated = available_transcript.translate(lang)
                                    transcript = translated
                                    used_language = lang
                                    break
                                except:
                                    continue
                            if transcript:
                                break
                    except:
                        pass
                
                # 如果翻译失败，尝试获取第一个可用的字幕
                if not transcript:
                    for available_transcript in transcript_list:
                        try:
                            transcript = available_transcript.fetch()
                            used_language = transcript.language_code
                            break
                        except:
                            continue
            except (NoTranscriptFound, TranscriptsDisabled, CouldNotRetrieveTranscript):
                pass
            except Exception as e:
                sys.stderr.write(f"获取任何可用字幕时出错: {str(e)}\n")
        
        if not transcript:
            return {
                'success': False,
                'error': '该视频没有可用的字幕（包括自动生成的字幕）。请确认视频已启用字幕功能。'
            }
        
        # 提取文本（从 snippets 中提取）
        text_parts = [snippet.text for snippet in transcript.snippets]
        text = ' '.join(text_parts)
        
        return {
            'success': True,
            'text': text,
            'language': used_language or transcript.language_code,
            'count': len(transcript.snippets)
        }
        
    except TranscriptsDisabled:
        return {
            'success': False,
            'error': '该视频已禁用字幕'
        }
    except NoTranscriptFound:
        return {
            'success': False,
            'error': '该视频没有可用的字幕'
        }
    except VideoUnavailable:
        return {
            'success': False,
            'error': '视频不可用或不存在'
        }
    except CouldNotRetrieveTranscript:
        return {
            'success': False,
            'error': '无法获取字幕，可能视频没有启用字幕功能'
        }
    except Exception as e:
        error_msg = str(e)
        return {
            'success': False,
            'error': f'获取字幕失败: {error_msg}'
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': '缺少视频 ID'}, ensure_ascii=False))
        sys.exit(1)
    
    video_id = sys.argv[1]
    languages = sys.argv[2].split(',') if len(sys.argv) > 2 else ['en']
    
    result = get_transcript(video_id, languages)
    print(json.dumps(result, ensure_ascii=False))
